import {
  ACESFilmicToneMapping,
  PCFSoftShadowMap,
  RenderPipeline,
  WebGPURenderer,
  type Camera,
  type Scene,
} from 'three/webgpu';
import { pass } from 'three/tsl';
import { bloom } from 'three/addons/tsl/display/BloomNode.js';

export interface GameRenderer {
  renderer: WebGPURenderer;
  /** true = real WebGPU, false = WebGL 2 fallback. */
  webgpu: boolean;
  render(scene: Scene, camera: Camera): void;
  resize(width: number, height: number): void;
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
  return {
    renderer,
    webgpu: backend.isWebGPUBackend === true,
    render: (scene, camera) => pipelineFor(scene, camera).render(),
    resize: (w, h) => renderer.setSize(w, h, false),
  };
}
