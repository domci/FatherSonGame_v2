import {
  ACESFilmicToneMapping,
  PCFSoftShadowMap,
  RenderPipeline,
  WebGPURenderer,
  type Camera,
  type Scene,
} from 'three/webgpu';
import { mix, pass, uniform } from 'three/tsl';
import { bloom } from 'three/addons/tsl/display/BloomNode.js';

export interface GameRenderer {
  renderer: WebGPURenderer;
  /** true = real WebGPU, false = WebGL 2 fallback. */
  webgpu: boolean;
  render(scene: Scene, camera: Camera): void;
  /** Draws two scenes and mixes them: share 0 = only `a`, 1 = only `b`. */
  renderMix(a: Shot, b: Shot, share: number): void;
  resize(width: number, height: number): void;
}

export interface Shot {
  scene: Scene;
  camera: Camera;
}

interface MixEntry {
  a: Shot;
  b: Shot;
  pipeline: RenderPipeline;
  share: { value: number };
}

interface PipelineEntry {
  scene: Scene;
  camera: Camera;
  pipeline: RenderPipeline;
}

function makePipeline(renderer: WebGPURenderer, scene: Scene, camera: Camera): RenderPipeline {
  const scenePass = pass(scene, camera);
  const color = scenePass.getTextureNode('output');
  const glow = bloom(color, 0.9, 0.4, 0.82);
  const pipeline = new RenderPipeline(renderer);
  pipeline.outputNode = color.add(glow);
  return pipeline;
}

function makeMixPipeline(renderer: WebGPURenderer, a: Shot, b: Shot): MixEntry {
  const share = uniform(0);
  const colorA = pass(a.scene, a.camera).getTextureNode('output');
  const colorB = pass(b.scene, b.camera).getTextureNode('output');
  const color = mix(colorA, colorB, share);
  const pipeline = new RenderPipeline(renderer);
  pipeline.outputNode = color.add(bloom(color, 0.9, 0.4, 0.82));
  return { a, b, pipeline, share };
}

/** Creates the WebGPU renderer (falls back to WebGL 2 by itself) with bloom glow. */
export async function createRenderer(canvas: HTMLCanvasElement): Promise<GameRenderer> {
  const renderer = new WebGPURenderer({ canvas, antialias: true });
  renderer.toneMapping = ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.1;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = PCFSoftShadowMap;
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  await renderer.init();
  const backend = renderer.backend as { isWebGPUBackend?: boolean };
  const pipelines: PipelineEntry[] = [];
  const pipelineFor = (scene: Scene, camera: Camera): RenderPipeline => {
    let entry = pipelines.find((p) => p.scene === scene && p.camera === camera);
    if (!entry) {
      entry = { scene, camera, pipeline: makePipeline(renderer, scene, camera) };
      pipelines.push(entry);
    }
    return entry.pipeline;
  };
  const mixes: MixEntry[] = [];
  const renderMix = (a: Shot, b: Shot, share: number): void => {
    let entry = mixes.find((m) => m.a.scene === a.scene && m.b.scene === b.scene);
    if (!entry) mixes.push((entry = makeMixPipeline(renderer, a, b)));
    entry.share.value = share;
    entry.pipeline.render();
  };
  return {
    renderer,
    webgpu: backend.isWebGPUBackend === true,
    render: (scene, camera) => pipelineFor(scene, camera).render(),
    renderMix,
    resize: (w, h) => renderer.setSize(w, h, false),
  };
}
