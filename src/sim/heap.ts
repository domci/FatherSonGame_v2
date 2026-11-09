/** Small binary min-heap of numbers with priorities (for A*). */
export class MinHeap {
  private items: number[] = [];
  private prio: number[] = [];

  get size(): number {
    return this.items.length;
  }

  push(item: number, priority: number): void {
    this.items.push(item);
    this.prio.push(priority);
    let i = this.items.length - 1;
    while (i > 0) {
      const parent = (i - 1) >> 1;
      if ((this.prio[parent] ?? 0) <= priority) break;
      this.swap(i, parent);
      i = parent;
    }
  }

  pop(): number | undefined {
    const top = this.items[0];
    const lastItem = this.items.pop();
    const lastPrio = this.prio.pop();
    if (this.items.length === 0 || lastItem === undefined || lastPrio === undefined) return top;
    this.items[0] = lastItem;
    this.prio[0] = lastPrio;
    this.sinkDown();
    return top;
  }

  private sinkDown(): void {
    const n = this.items.length;
    let i = 0;
    for (;;) {
      const l = 2 * i + 1;
      const r = l + 1;
      let best = i;
      if (l < n && (this.prio[l] ?? 0) < (this.prio[best] ?? 0)) best = l;
      if (r < n && (this.prio[r] ?? 0) < (this.prio[best] ?? 0)) best = r;
      if (best === i) return;
      this.swap(i, best);
      i = best;
    }
  }

  private swap(a: number, b: number): void {
    [this.items[a], this.items[b]] = [this.items[b] ?? 0, this.items[a] ?? 0];
    [this.prio[a], this.prio[b]] = [this.prio[b] ?? 0, this.prio[a] ?? 0];
  }
}
