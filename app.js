const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

const state = {
  taskSource: "wechat",
  tasks: [],
  manualTasks: [],
  completedKeys: new Set(),
  skippedKeys: new Set(),
  selectedTask: null,
  productInfo: null,
  revealTaskKey: "",
  settings: null,
  productDescriptions: [],
  productPreviewUrls: new Map(),
  productMatches: [],
  buttonResults: [],
  buttonResultId: 0,
  distribution: {
    loaded: false,
    loading: false,
    tasks: [],
    counts: { pending: 0, synced: 0, skipped: 0 },
    filter: "pending",
    selectedId: "",
    detail: null,
    selectedVersion: 0,
  },
};
const CID = "53qvofdc";
const MANUAL_TASKS_KEY = "lizhi.manualTasks.v1";
const COMPLETED_TASKS_KEY = "lizhi.completedTasks.v1";
const SKIPPED_TASKS_KEY = "lizhi.skippedTasks.v1";
const TASK_SOURCE_KEY = "lizhi.taskSource.v1";
const DOWNLOAD_DIR_KEY = "lizhi.downloadDir.v1";
const MAX_DISTRIBUTION_VERSIONS = 4;
const ANNOTATION_NUMBER_SIZE = 110;
const ANNOTATION_HANDLE_SIZE = 18;
const ANNOTATION_MAGNIFIER_COLOR = "#ff594b";
const ANNOTATION_MAGNIFIER_LINE_WIDTH = 5;
const IMAGE_EXPORT_WIDTH = 2000;
const SYSTEM_CORNER_RADIUS = 32;
const CONTINUOUS_CORNER_EXPONENT = 4;
const CONTINUOUS_CORNER_EXTENT = 1.52866483;
const BLUE_BG_ASSET_URL = "./assets/lizhi-blue-wallpaper.png";
const BLUE_BG_MAX_LAYERS = 3;
const BLUE_BG_HANDLE_SIZE = 28;
const LIZHI_DEFAULT_COLOR = "#8CC6FF";
const BG_DEFAULT_COLOR = "#3FB9FF";
const BG_CUSTOM_COLOR_KEY = "litu.backgroundCustomColor.v1";
const BG_ANNOTATION_CUSTOM_COLORS = {
  mask: { key: "litu.annotationCustomColor.mask.v1", fallback: "#98b2c0", input: "#bgAnnotationMaskColor" },
  number: { key: "litu.annotationCustomColor.number.v1", fallback: "#ff5a52", input: "#bgAnnotationNumberColor" },
  magnifier: { key: "litu.annotationCustomColor.magnifier.v1", fallback: "#ff594b", input: "#bgAnnotationMagnifierColor" },
  pen: { key: "litu.annotationCustomColor.pen.v1", fallback: "#ff5a52", input: "#bgAnnotationPenColor" },
};
const BG_ASPECTS = {
  default: { label: "默认", value: "default" },
  blue: { label: "蓝底（2000 / 1083）", value: "blue" },
  square: { label: "正方形（1 / 1）", value: "1:1", ratio: 1 },
  landscape: { label: "横图（4 / 3）", value: "4:3", ratio: 4 / 3 },
  portrait: { label: "竖图（3 / 4）", value: "3:4", ratio: 3 / 4 },
  widescreen: { label: "宽屏（16 / 9）", value: "16:9", ratio: 16 / 9 },
  vertical: { label: "竖屏（9 / 16）", value: "9:16", ratio: 9 / 16 },
};
const BG_GRADIENT_PRESETS = [
  { id: "sky", label: "晴空蓝", from: "#42B5F5", to: "#E8F5FF", angle: 135 },
  { id: "sunset", label: "晚霞橙粉", from: "#FF9A9E", to: "#FAD0C4", angle: 135 },
  { id: "aurora", label: "极光紫绿", from: "#A8EDEA", to: "#FED6E3", angle: 135 },
  { id: "midnight", label: "午夜蓝紫", from: "#1B2755", to: "#6B4FA1", angle: 135 },
  { id: "mint", label: "薄荷奶油", from: "#D4FC79", to: "#96E6A1", angle: 135 },
];
let customBgGradients = [];
let customBgWallpapers = [];
let customBgAspects = [];
const SYSTEM_WALLPAPERS = [
  { id: "macos-11", label: "Big Sur", url: "./assets/wallpapers/macos-11-big-sur.jpg", source: "512 Pixels" },
  { id: "macos-12", label: "Monterey", url: "./assets/wallpapers/macos-12-monterey.jpg", source: "AppleWalls" },
  { id: "macos-13", label: "Ventura", url: "./assets/wallpapers/macos-13-ventura.webp", source: "AppleWalls" },
  { id: "macos-14", label: "Sonoma", url: "./assets/wallpapers/macos-14-sonoma.webp", source: "AppleWalls" },
  { id: "macos-15", label: "Sequoia", url: "./assets/wallpapers/macos-15-sequoia.webp", source: "AppleWalls" },
  { id: "macos-26", label: "Tahoe", url: "./assets/wallpapers/macos-26-tahoe.jpg", source: "512 Pixels" },
  { id: "macos-27", label: "Golden Gate", url: "./assets/wallpapers/macos-27-golden-gate.jpg", source: "Basic Apple Guy" },
  { id: "windows-10", label: "Windows 10", url: "./assets/wallpapers/windows-10.jpg", source: "Microsoft" },
  { id: "windows-11", label: "Windows 11", url: "./assets/wallpapers/windows-11.jpg", source: "Microsoft" },
];
let marchingAntsOffset = 0;
function createBgCanvasState() {
  return {
  background: null,
  backgroundType: "lizhi",
  backgroundColor: BG_DEFAULT_COLOR,
  backgroundGradient: "sky",
  backgroundImage: null,
  backgroundImageUrl: "",
  backgroundImageName: "",
  aspectMode: "default",
  canvasWidth: 2000,
  canvasHeight: 1083,
  defaultAspect: 2000 / 1083,
  headerImage: null,
  footerImage: null,
  layers: [],
  selectedId: null,
  selectedIds: [],
  nextId: 1,
  interaction: null,
  sourceName: "",
  outputUrl: "",
  zoom: 1,
  baseDisplayWidth: 0,
  baseDisplayHeight: 0,
  gestureStartZoom: 1,
  scrollLeft: 0,
  scrollTop: 0,
  inspectorMode: "background",
  toolMode: "background",
  snapGuides: { vertical: [], horizontal: [] },
  };
}
let blueBgState = createBgCanvasState();
let bgMaterials = [];
let bgSelectedMaterialIndex = -1;
let bgSelectedMaterialIndices = [];
let bgGeneratedResults = [];
let bgHistory = [];
let bgHistoryIndex = -1;
let bgMaterialPointerDrag = null;
let suppressBgMaterialClick = false;
let bgContextMaterialIndex = -1;
let bgMaterialStackSequence = 0;
const bgRenderControllers = new WeakMap();
const blueBgLayerSurfaceCache = new WeakMap();

// —— 画布标签页：每个标签一份独立画布与标注状态，素材库全局共享 ——
const BG_TAB_LIMIT = 7;
const bgTabList = [];
let activeBgTabId = null;
let bgTabSequence = 0;

function currentBgTab() {
  return bgTabList.find(tab => tab.id === activeBgTabId) || null;
}

function bgTabTitle(tab) {
  const namedLayer = tab.canvas.layers.find(layer => layer.fileName)?.fileName;
  return tab.canvas.sourceName || namedLayer || `画布 ${bgTabList.indexOf(tab) + 1}`;
}

function createBgTab({ activate = true } = {}) {
  if (bgTabList.length >= BG_TAB_LIMIT) {
    blueBgStatus(`最多支持 ${BG_TAB_LIMIT} 个画布标签。`);
    return null;
  }
  bgTabSequence += 1;
  const tab = {
    id: `bg-tab-${bgTabSequence}`,
    canvas: createBgCanvasState(),
    annotation: createAnnotationState("bg"),
    history: [],
    historyIndex: -1,
  };
  bgTabList.push(tab);
  if (activate) switchBgTab(tab.id);
  else renderBgTabs();
  revealCanvasTabEnd($("#bgCanvasTabs"));
  return tab;
}

function closeBgTab(tabId) {
  const index = bgTabList.findIndex(tab => tab.id === tabId);
  if (index < 0) return;
  const wasActive = bgTabList[index].id === activeBgTabId;
  bgTabList.splice(index, 1);
  if (!bgTabList.length) {
    activeBgTabId = null;
    createBgTab();
    return;
  }
  if (wasActive) {
    const next = bgTabList[Math.min(index, bgTabList.length - 1)];
    switchBgTab(next.id);
    return;
  }
  renderBgTabs();
}

function switchBgTab(tabId, { renderTabs = true } = {}) {
  const target = bgTabList.find(tab => tab.id === tabId);
  if (!target) return;
  if (target.id === activeBgTabId) {
    if (renderTabs) renderBgTabs();
    return;
  }
  const previous = currentBgTab();
  if (previous) {
    previous.history = bgHistory;
    previous.historyIndex = bgHistoryIndex;
    // 记下离开时的视图位置，切回来时一并还原。
    const stage = $("#blueBgStage");
    previous.canvas.scrollLeft = stage.scrollLeft;
    previous.canvas.scrollTop = stage.scrollTop;
  }
  activeBgTabId = target.id;
  blueBgState = target.canvas;
  bgAnnotationState = target.annotation;
  bgHistory = target.history;
  bgHistoryIndex = target.historyIndex;
  annotationState = bgAnnotationState;
  if (renderTabs) renderBgTabs();
  $("#blueBgEditor").hidden = false;
  $("#bgPreview").hidden = true;
  ensureUnifiedBgBackground(null, target.canvas, { preserveCanvasSize: true })
    .then(() => {
      if (activeBgTabId !== target.id) return;
      updateBlueBgControls();
      renderBlueBgCanvas();
      // 切回本画布时恢复该标签自己的缩放比例，不重置成 100%。
      resetBlueBgZoom(target.canvas.zoom);
      // 缩放尺寸在 resetBlueBgZoom 的下一帧才落到 DOM，滚动位置要再等一帧还原。
      requestAnimationFrame(() => {
        if (activeBgTabId !== target.id) return;
        const stage = $("#blueBgStage");
        stage.scrollLeft = target.canvas.scrollLeft || 0;
        stage.scrollTop = target.canvas.scrollTop || 0;
      });
      if (!blueBgState.layers.length) {
        blueBgStatus("当前画布为空：点击左侧素材库图片加入，或导入新图片。");
      } else {
        blueBgStatus(
          `画布缩放 ${Math.round(target.canvas.zoom * 100)}% · 共 ${blueBgState.layers.length} 张图片`
        );
      }
    })
    .catch(err => blueBgStatus(err.message));
}

// 拖拽排序：只调整标签顺序，激活标签跟着自己的 id 走，不改变当前画布。
function moveBgTab(from, to) {
  if (from === to || from < 0 || to < 0 || from >= bgTabList.length || to >= bgTabList.length) return;
  const [tab] = bgTabList.splice(from, 1);
  bgTabList.splice(to, 0, tab);
  renderBgTabs();
}

// —— 画布标签栏共用交互 ——
// 「美化 / 标注」与「高级编辑」共用同一套标签行为：宽度固定、放不下时横向滑动、
// 可拖拽排序、右键菜单关闭。关闭按钮已移除，关闭入口统一走右键菜单。
let canvasTabDragState = null;
let suppressCanvasTabClick = false;
let canvasTabContextTarget = null;

// 标签宽度固定，标题放不下时改为左对齐并让右端渐隐。
function syncCanvasTabBar(wrap) {
  if (!wrap || !wrap.clientWidth) return;
  wrap.querySelectorAll(".bg-canvas-tab").forEach(tabButton => {
    const label = tabButton.querySelector(".bg-canvas-tab-label");
    const overflow = Boolean(label) && label.scrollWidth > label.clientWidth + 1;
    tabButton.classList.toggle("is-overflow", overflow);
  });
  updateCanvasTabScrollHint(wrap);
}

// 还能往两边滑就给对应方向加渐隐提示。
function updateCanvasTabScrollHint(wrap) {
  if (!wrap) return;
  const maxScroll = Math.max(0, wrap.scrollWidth - wrap.clientWidth);
  const current = Math.min(Math.max(wrap.scrollLeft, 0), maxScroll);
  wrap.classList.toggle("has-scroll-left", maxScroll > 1 && current > 1);
  wrap.classList.toggle("has-scroll-right", maxScroll > 1 && current < maxScroll - 1);
}

function buildCanvasTabElements(wrap, items, activeId, dataKey) {
  // 标签重建前先记住横向位置，避免切换/重排后视图跳回最左。
  const previousScrollLeft = wrap.scrollLeft;
  wrap.innerHTML = "";
  items.forEach(item => {
    const tabButton = document.createElement("div");
    tabButton.className = `bg-canvas-tab${item.id === activeId ? " active" : ""}`;
    tabButton.dataset[dataKey] = item.id;
    tabButton.setAttribute("role", "tab");
    tabButton.setAttribute("aria-selected", item.id === activeId ? "true" : "false");
    tabButton.setAttribute("aria-label", item.title);
    tabButton.title = item.title;
    const label = document.createElement("span");
    label.className = "bg-canvas-tab-label";
    label.textContent = item.title;
    tabButton.appendChild(label);
    wrap.appendChild(tabButton);
  });
  wrap.scrollLeft = Math.min(previousScrollLeft, Math.max(0, wrap.scrollWidth - wrap.clientWidth));
  syncCanvasTabBar(wrap);
}

// 新建标签后保证新标签落在视野内。
function revealCanvasTabEnd(wrap) {
  if (!wrap) return;
  requestAnimationFrame(() => {
    wrap.scrollLeft = Math.max(0, wrap.scrollWidth - wrap.clientWidth);
  });
}

function showCanvasTabContextMenu(config, tabButton, clientX, clientY) {
  const menu = $("#canvasTabContextMenu");
  if (!menu) return;
  hideCanvasTabContextMenu();
  canvasTabContextTarget = { config, tabId: tabButton.dataset[config.dataKey] };
  menu.style.left = `${Math.min(clientX, window.innerWidth - 160)}px`;
  menu.style.top = `${Math.min(clientY, window.innerHeight - 52)}px`;
  menu.hidden = false;
}

function hideCanvasTabContextMenu() {
  const menu = $("#canvasTabContextMenu");
  if (menu) menu.hidden = true;
  canvasTabContextTarget = null;
}

function closeCanvasTabFromMenu() {
  const target = canvasTabContextTarget;
  hideCanvasTabContextMenu();
  if (target) target.config.onClose(target.tabId);
}

// 拖拽排序：原位标签留空占位，克隆一份拖影跟着指针，其余标签平移让位。
function beginCanvasTabDrag(event, config) {
  if (event.button !== 0 || canvasTabDragState) return;
  const wrap = config.wrap;
  const tabButton = event.target.closest(".bg-canvas-tab");
  if (!tabButton || !wrap.contains(tabButton)) return;
  const originIdx = Array.from(wrap.querySelectorAll(".bg-canvas-tab")).indexOf(tabButton);
  if (originIdx < 0) return;
  hideCanvasTabContextMenu();
  const rect = tabButton.getBoundingClientRect();
  const drag = {
    config, wrap, tab: tabButton, originIdx, rect, ghost: null, rafId: 0,
    startX: event.clientX, startY: event.clientY, lastX: event.clientX,
    moved: false, targetIdx: originIdx,
  };
  const onMove = ev => {
    if (!drag.moved) {
      if (Math.abs(ev.clientX - drag.startX) <= 5 && Math.abs(ev.clientY - drag.startY) <= 5) return;
      startCanvasTabDragPreview(drag);
    }
    drag.lastX = ev.clientX;
    positionCanvasTabGhost(drag, ev.clientX);
    drag.targetIdx = canvasTabDropIndex(drag);
    renderCanvasTabDragPreview(drag);
  };
  const detach = () => {
    window.removeEventListener("pointermove", onMove);
    window.removeEventListener("pointerup", onUp);
    window.removeEventListener("pointercancel", onCancel);
    if (drag.rafId) cancelAnimationFrame(drag.rafId);
    drag.rafId = 0;
    if (canvasTabDragState === drag) canvasTabDragState = null;
  };
  const onUp = () => {
    detach();
    if (!drag.moved) return;
    // 拖拽结束后紧跟着的那次 click 是「松手」而不是「点击」，抑制掉。
    suppressCanvasTabClick = true;
    setTimeout(() => { suppressCanvasTabClick = false; }, 0);
    finishCanvasTabDragPreview(drag);
    if (drag.targetIdx !== drag.originIdx) config.onMove(drag.originIdx, drag.targetIdx);
  };
  const onCancel = () => {
    detach();
    if (drag.moved) finishCanvasTabDragPreview(drag);
  };
  canvasTabDragState = drag;
  window.addEventListener("pointermove", onMove);
  window.addEventListener("pointerup", onUp);
  window.addEventListener("pointercancel", onCancel);
}

function startCanvasTabDragPreview(drag) {
  drag.moved = true;
  const tabs = Array.from(drag.wrap.querySelectorAll(".bg-canvas-tab"));
  // 拖拽即选中：先切到这张画布，再把 active 标记挪到被拖的标签上。
  // 切换时刻意不重渲染标签栏（renderTabs: false）——重建 DOM 会销毁被拖的节点，
  // 拖影会闪跳、让位状态也会丢，所以 active 类在这里手动同步。
  if (!drag.tab.classList.contains("active")) {
    drag.config.onSelect(drag.tab.dataset[drag.config.dataKey], { renderTabs: false });
    tabs.forEach(tab => tab.classList.toggle("active", tab === drag.tab));
  }
  drag.tab.classList.add("is-drag-placeholder");
  document.body.classList.add("canvas-tab-dragging");
  // 记成普通对象：拖到两端自动滚动时，这些坐标要跟着滚动量平移。
  drag.positions = tabs.map(tab => {
    const box = tab.getBoundingClientRect();
    return { left: box.left, top: box.top, width: box.width, height: box.height };
  });
  // 让位步长取相邻标签的中心距，固定宽度下即「标签宽 + 间距」。
  drag.stride = drag.positions.length > 1
    ? (drag.positions[1].left + drag.positions[1].width / 2) - (drag.positions[0].left + drag.positions[0].width / 2)
    : drag.rect.width;
  const ghost = drag.tab.cloneNode(true);
  ghost.className = `${drag.tab.className} bg-canvas-tab-ghost`;
  ghost.classList.remove("is-drag-placeholder");
  ghost.removeAttribute("style");
  ghost.style.width = `${drag.rect.width}px`;
  ghost.style.height = `${drag.rect.height}px`;
  ghost.style.left = `${drag.rect.left}px`;
  ghost.style.top = `${drag.rect.top}px`;
  document.body.appendChild(ghost);
  drag.ghost = ghost;
  drag.rafId = requestAnimationFrame(() => canvasTabDragAutoScroll(drag));
}

// 拖影中心对准指针，并被钳制在标签栏范围内。
function positionCanvasTabGhost(drag, clientX) {
  const barRect = drag.wrap.getBoundingClientRect();
  const maxLeft = Math.max(barRect.left, barRect.right - drag.rect.width);
  const safeLeft = Math.max(barRect.left, Math.min(clientX - drag.rect.width / 2, maxLeft));
  drag.ghost.style.left = `${safeLeft}px`;
  drag.ghost.style.top = `${drag.rect.top}px`;
}

// 拖着指针停在标签栏两端时持续横向滚动，让滚出视野的标签也能拖到。
function canvasTabDragAutoScroll(drag) {
  if (!drag.moved || !drag.ghost) return;
  const wrap = drag.wrap;
  const barRect = wrap.getBoundingClientRect();
  const maxScroll = Math.max(0, wrap.scrollWidth - wrap.clientWidth);
  const edgeZone = 24;
  const atLeft = drag.lastX < barRect.left + edgeZone;
  const atRight = drag.lastX > barRect.right - edgeZone;
  if (maxScroll > 0 && (atLeft || atRight)) {
    const next = Math.min(Math.max(wrap.scrollLeft + (atLeft ? -10 : 10), 0), maxScroll);
    const applied = next - wrap.scrollLeft;
    if (applied) {
      wrap.scrollLeft = next;
      drag.positions.forEach(pos => { pos.left -= applied; });
      drag.rect.left -= applied;
      positionCanvasTabGhost(drag, drag.lastX);
      drag.targetIdx = canvasTabDropIndex(drag);
      renderCanvasTabDragPreview(drag);
    }
  }
  drag.rafId = requestAnimationFrame(() => canvasTabDragAutoScroll(drag));
}

// 拖影中心越过哪个标签的中线，就落在哪个标签的位置上。
function canvasTabDropIndex(drag) {
  const ghostRect = drag.ghost.getBoundingClientRect();
  const center = ghostRect.left + ghostRect.width / 2;
  const origin = drag.originIdx;
  const middleOf = i => drag.positions[i].left + drag.positions[i].width / 2;
  let target = origin;
  if (center < middleOf(origin)) {
    for (let i = origin - 1; i >= 0; i--) {
      if (center <= middleOf(i)) target = i;
    }
  } else if (center > middleOf(origin)) {
    for (let i = origin + 1; i < drag.positions.length; i++) {
      if (center >= middleOf(i)) target = i;
    }
  }
  return target;
}

function renderCanvasTabDragPreview(drag) {
  const shift = drag.stride;
  drag.wrap.querySelectorAll(".bg-canvas-tab").forEach((tab, i) => {
    if (tab === drag.tab) return;
    let x = 0;
    if (drag.targetIdx < drag.originIdx && i >= drag.targetIdx && i < drag.originIdx) x = shift;
    if (drag.targetIdx > drag.originIdx && i > drag.originIdx && i <= drag.targetIdx) x = -shift;
    tab.style.transform = x ? `translateX(${x}px)` : "";
    tab.classList.toggle("is-shifting", Boolean(x));
  });
}

function finishCanvasTabDragPreview(drag) {
  drag.ghost?.remove();
  drag.ghost = null;
  document.body.classList.remove("canvas-tab-dragging");
  drag.wrap.querySelectorAll(".bg-canvas-tab").forEach(tab => {
    tab.style.transform = "";
    tab.classList.remove("is-shifting", "is-drag-placeholder");
  });
}

// 滚轮纵向滚动转成标签栏横向滑动；原生横向滚动仍交给浏览器。
function initCanvasTabWheelScroll(wrap) {
  wrap.addEventListener("wheel", event => {
    if (wrap.scrollWidth <= wrap.clientWidth) return;
    if (Math.abs(event.deltaX) > Math.abs(event.deltaY)) return;
    event.preventDefault();
    const maxScroll = Math.max(0, wrap.scrollWidth - wrap.clientWidth);
    wrap.scrollLeft = Math.min(Math.max(wrap.scrollLeft + event.deltaY, 0), maxScroll);
  }, { passive: false });
}

// 标签栏宽度随窗口或侧栏变化时重新判定溢出与滑动提示。
const canvasTabBarResizeObserver = typeof ResizeObserver === "undefined"
  ? null
  : new ResizeObserver(entries => {
    entries.forEach(entry => {
      if (!entry.target.clientWidth) return;
      requestAnimationFrame(() => syncCanvasTabBar(entry.target));
    });
  });

function setupCanvasTabBar(config) {
  const { wrap } = config;
  if (!wrap || wrap.dataset.canvasTabBarReady) return;
  wrap.dataset.canvasTabBarReady = "true";
  wrap.addEventListener("click", event => {
    if (suppressCanvasTabClick) return;
    const tabButton = event.target.closest(".bg-canvas-tab");
    if (tabButton) config.onSelect(tabButton.dataset[config.dataKey]);
  });
  // 中键点标签仍是直接关闭，保留原来的快捷操作。
  wrap.addEventListener("auxclick", event => {
    if (event.button !== 1) return;
    const tabButton = event.target.closest(".bg-canvas-tab");
    if (tabButton) config.onClose(tabButton.dataset[config.dataKey]);
  });
  wrap.addEventListener("contextmenu", event => {
    const tabButton = event.target.closest(".bg-canvas-tab");
    if (!tabButton) return;
    event.preventDefault();
    showCanvasTabContextMenu(config, tabButton, event.clientX, event.clientY);
  });
  wrap.addEventListener("pointerdown", event => beginCanvasTabDrag(event, config));
  wrap.addEventListener("scroll", () => updateCanvasTabScrollHint(wrap), { passive: true });
  initCanvasTabWheelScroll(wrap);
  canvasTabBarResizeObserver?.observe(wrap);
}

function renderBgTabs() {
  const wrap = $("#bgCanvasTabs");
  const bar = $("#bgCanvasTabBar");
  if (!wrap || !bar) return;
  bar.hidden = false;
  buildCanvasTabElements(
    wrap,
    bgTabList.map(tab => ({ id: tab.id, title: bgTabTitle(tab) })),
    activeBgTabId,
    "bgTabId"
  );
}

function syncActiveBgTabTitle() {
  if (!currentBgTab()) return;
  renderBgTabs();
}

let bgAnnotationState = createAnnotationState("bg");
// 高级编辑也支持多画布标签：每个标签持有一份完整状态（含历史与缩放），
// imageEditorState 始终指向当前标签，其余代码照旧读写它即可。
function createImageEditorState() {
  return {
    documentCanvas: document.createElement("canvas"),
    sourceName: "",
    hasImage: false,
    mode: "view",
    selection: null,
    interaction: null,
    gradient: null,
    snapGuides: { vertical: [], horizontal: [] },
    history: [],
    historyIndex: -1,
    zoom: 1,
    baseDisplayWidth: 0,
    baseDisplayHeight: 0,
    gestureStartZoom: 1,
    scrollLeft: 0,
    scrollTop: 0,
    secondImage: null,
    sourceBgMaterialIndex: null,
    sourceBgLayerId: null,
    inpaintSize: 40,
    coverShape: "rect",
    screen: null,
  };
}

const IMAGE_EDITOR_TAB_LIMIT = 7;
const imageEditorTabList = [];
let activeImageEditorTabId = null;
let imageEditorTabSequence = 0;
let imageEditorState = createImageEditorState();

function currentImageEditorTab() {
  return imageEditorTabList.find(tab => tab.id === activeImageEditorTabId) || null;
}

function imageEditorTabTitle(tab) {
  return tab.state.sourceName || `画布 ${imageEditorTabList.indexOf(tab) + 1}`;
}

function createImageEditorTab({ activate = true } = {}) {
  if (imageEditorTabList.length >= IMAGE_EDITOR_TAB_LIMIT) {
    imageEditorStatus(`最多支持 ${IMAGE_EDITOR_TAB_LIMIT} 个画布标签。`);
    return null;
  }
  imageEditorTabSequence += 1;
  const tab = { id: `image-editor-tab-${imageEditorTabSequence}`, state: createImageEditorState() };
  imageEditorTabList.push(tab);
  if (activate) switchImageEditorTab(tab.id);
  else renderImageEditorTabs();
  revealCanvasTabEnd($("#imageEditorTabs"));
  return tab;
}

function closeImageEditorTab(tabId) {
  const index = imageEditorTabList.findIndex(tab => tab.id === tabId);
  if (index < 0) return;
  const wasActive = imageEditorTabList[index].id === activeImageEditorTabId;
  imageEditorTabList.splice(index, 1);
  if (!imageEditorTabList.length) {
    activeImageEditorTabId = null;
    createImageEditorTab();
    return;
  }
  if (wasActive) {
    const next = imageEditorTabList[Math.min(index, imageEditorTabList.length - 1)];
    switchImageEditorTab(next.id);
    return;
  }
  renderImageEditorTabs();
}

function switchImageEditorTab(tabId, { renderTabs = true } = {}) {
  const target = imageEditorTabList.find(tab => tab.id === tabId);
  if (!target) return;
  if (target.id === activeImageEditorTabId) {
    if (renderTabs) renderImageEditorTabs();
    return;
  }
  const previous = currentImageEditorTab();
  if (previous) {
    const stage = $("#imageEditorStage");
    previous.state.scrollLeft = stage.scrollLeft;
    previous.state.scrollTop = stage.scrollTop;
  }
  activeImageEditorTabId = target.id;
  imageEditorState = target.state;
  if (renderTabs) renderImageEditorTabs();
  syncImageEditorTabView(target.id);
}

// 切换标签后把画布、缩放与控件状态整体切到当前标签。
function syncImageEditorTabView(tabId = activeImageEditorTabId) {
  const stage = $("#imageEditorStage");
  const canvas = imageEditorCanvas();
  stage.classList.toggle("has-image", imageEditorState.hasImage);
  stage.dataset.mode = imageEditorState.mode;
  if (imageEditorState.hasImage) {
    renderImageEditorCanvas();
    resetImageEditorZoom(imageEditorState.zoom);
  } else {
    canvas.width = 0;
    canvas.height = 0;
    canvas.style.width = "";
    canvas.style.height = "";
    canvas.style.maxWidth = "";
    canvas.style.maxHeight = "";
    imageEditorState.baseDisplayWidth = 0;
    imageEditorState.baseDisplayHeight = 0;
    stage.classList.remove("at-base-zoom");
    $("#imageEditorCanvasZoom").value = "100";
    $("#imageEditorCanvasZoomValue").textContent = "100%";
  }
  updateImageEditorControls();
  syncImageEditorOverlays();
  // 换屏的角点覆盖层与放大镜属于当前标签，切换时要一起刷新/收起。
  imageEditorScreenSyncOverlay();
  imageEditorScreenHideMagnifier();
  requestAnimationFrame(() => {
    if (activeImageEditorTabId !== tabId) return;
    stage.scrollLeft = imageEditorState.scrollLeft || 0;
    stage.scrollTop = imageEditorState.scrollTop || 0;
  });
}

// 拖拽排序：只调整标签顺序，激活标签跟着自己的 id 走，不改变当前画布。
function moveImageEditorTab(from, to) {
  if (from === to || from < 0 || to < 0 || from >= imageEditorTabList.length || to >= imageEditorTabList.length) return;
  const [tab] = imageEditorTabList.splice(from, 1);
  imageEditorTabList.splice(to, 0, tab);
  renderImageEditorTabs();
}

function renderImageEditorTabs() {
  const wrap = $("#imageEditorTabs");
  const bar = $("#imageEditorTabBar");
  if (!wrap || !bar) return;
  bar.hidden = false;
  buildCanvasTabElements(
    wrap,
    imageEditorTabList.map(tab => ({ id: tab.id, title: imageEditorTabTitle(tab) })),
    activeImageEditorTabId,
    "imageEditorTabId"
  );
}

function syncActiveImageEditorTabTitle() {
  if (!currentImageEditorTab()) return;
  renderImageEditorTabs();
}

function createAnnotationState(host = "annotation") {
  return {
  host,
  image: null,
  sourceName: "",
  mode: "view",
  items: [],
  selectedId: null,
  selectedIds: [],
  selectedPart: null,
  numberSize: ANNOTATION_NUMBER_SIZE,
  numberColor: "#ff5a52",
  blurStrength: 6,
  maskColor: "#98b2c0",
  maskRound: false,
  maskRoundRadius: 16,
  penColor: "#ff5a52",
  penWidth: 6,
  magnifierColor: ANNOTATION_MAGNIFIER_COLOR,
  magnifierWidth: ANNOTATION_MAGNIFIER_LINE_WIDTH,
  shadows: { number: false, mask: false, blur: false, magnifier: false },
  nextNumber: 1,
  nextId: 1,
  interaction: null,
  snapGuides: { vertical: [], horizontal: [] },
  zoom: 1,
  baseDisplayWidth: 0,
  baseDisplayHeight: 0,
  gestureStartZoom: 1,
  editingNumberId: null,
  editingNumberOriginal: null,
  history: [],
  historyIndex: -1,
  };
}
const nativeAnnotationState = createAnnotationState("annotation");
// bgAnnotationState 由画布标签页管理（见 bgTabList 处的 let 声明），
// 每个标签页持有一份独立的标注状态。
let annotationState = nativeAnnotationState;
let completionAudioCtx = null;

function canvasDisplayUnit(canvas) {
  const rect = canvas.getBoundingClientRect();
  const scale = rect.width > 0 ? rect.width / canvas.width : 1;
  return 1 / Math.max(scale, 0.0001);
}

function drawMarchingAntsSelection(ctx, canvas, bounds, handles = true) {
  const unit = canvasDisplayUnit(canvas);
  const dash = 5 * unit;
  ctx.save();
  ctx.lineWidth = unit;
  ctx.strokeStyle = "#ffffff";
  ctx.setLineDash([]);
  ctx.strokeRect(bounds.x, bounds.y, bounds.width, bounds.height);
  ctx.strokeStyle = "#111111";
  ctx.setLineDash([dash, dash]);
  ctx.lineDashOffset = -marchingAntsOffset * unit;
  ctx.strokeRect(bounds.x, bounds.y, bounds.width, bounds.height);
  if (handles) {
    const radius = 3.5 * unit;
    ctx.setLineDash([]);
    ctx.fillStyle = "#ffffff";
    ctx.strokeStyle = "#111111";
    ctx.lineWidth = unit;
    [
      [bounds.x, bounds.y],
      [bounds.x + bounds.width, bounds.y],
      [bounds.x + bounds.width, bounds.y + bounds.height],
      [bounds.x, bounds.y + bounds.height],
    ].forEach(([x, y]) => {
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    });
  }
  ctx.restore();
}

function syncCanvasSelectionOverlay(stage, canvas, overlay, bounds) {
  if (!stage || !canvas || !overlay || !bounds) {
    if (overlay) overlay.hidden = true;
    return;
  }
  const stageRect = stage.getBoundingClientRect();
  const canvasRect = canvas.getBoundingClientRect();
  const scaleX = canvasRect.width / Math.max(1, canvas.width);
  const scaleY = canvasRect.height / Math.max(1, canvas.height);
  const frame = selectionFrameBounds(canvas, bounds);
  overlay.hidden = false;
  overlay.style.left = `${canvasRect.left - stageRect.left + stage.scrollLeft + frame.x * scaleX}px`;
  overlay.style.top = `${canvasRect.top - stageRect.top + stage.scrollTop + frame.y * scaleY}px`;
  overlay.style.width = `${Math.max(2, frame.width * scaleX)}px`;
  overlay.style.height = `${Math.max(2, frame.height * scaleY)}px`;
}

function selectionFrameBounds(canvas, bounds) {
  const margin = canvasDisplayUnit(canvas);
  return {
    x: bounds.x - margin,
    y: bounds.y - margin,
    width: bounds.width + margin * 2,
    height: bounds.height + margin * 2,
  };
}

function unionBounds(boundsList) {
  const valid = boundsList.filter(Boolean);
  if (!valid.length) return null;
  const left = Math.min(...valid.map(bounds => bounds.x));
  const top = Math.min(...valid.map(bounds => bounds.y));
  const right = Math.max(...valid.map(bounds => bounds.x + bounds.width));
  const bottom = Math.max(...valid.map(bounds => bounds.y + bounds.height));
  return { x: left, y: top, width: right - left, height: bottom - top };
}

function syncCanvasSelectionOverlays(stage, canvas, primaryOverlay, selections) {
  if (!stage || !canvas || !primaryOverlay) return;
  const owner = primaryOverlay.id || primaryOverlay.dataset.selectionOwner || "selection";
  const secondaryOverlays = $$(".multi-selection-overlay", stage)
    .filter(overlay => overlay.dataset.selectionOwner === owner);
  if (!selections.length) {
    syncCanvasSelectionOverlay(stage, canvas, primaryOverlay, null);
    secondaryOverlays.forEach(overlay => overlay.remove());
    return;
  }
  const usedSecondaryOverlays = new Set();
  selections.forEach((selection, index) => {
    const selectionKey = String(selection.id ?? index);
    const overlay = index === 0
      ? primaryOverlay
      : secondaryOverlays.find(candidate =>
          !usedSecondaryOverlays.has(candidate) && candidate.dataset.selectionKey === selectionKey
        ) || secondaryOverlays.find(candidate => !usedSecondaryOverlays.has(candidate)) || primaryOverlay.cloneNode(true);
    if (index > 0) {
      if (!overlay.classList.contains("multi-selection-overlay")) {
        overlay.removeAttribute("id");
        overlay.classList.add("multi-selection-overlay");
        overlay.dataset.selectionOwner = owner;
        stage.appendChild(overlay);
      }
      overlay.dataset.selectionKey = selectionKey;
      usedSecondaryOverlays.add(overlay);
    }
    syncCanvasSelectionOverlay(stage, canvas, overlay, selection.bounds);
  });
  secondaryOverlays
    .filter(overlay => !usedSecondaryOverlays.has(overlay))
    .forEach(overlay => overlay.remove());
}

const selectionCursorByHandle = {
  n: "ns-resize",
  s: "ns-resize",
  e: "ew-resize",
  w: "ew-resize",
  nw: "nwse-resize",
  se: "nwse-resize",
  ne: "nesw-resize",
  sw: "nesw-resize",
};

function hitSelectionHandle(bounds, point, canvas, tolerancePx = 12) {
  const rect = canvas.getBoundingClientRect();
  const toleranceX = tolerancePx * canvas.width / Math.max(1, rect.width);
  const toleranceY = tolerancePx * canvas.height / Math.max(1, rect.height);
  const left = bounds.x;
  const top = bounds.y;
  const right = bounds.x + bounds.width;
  const bottom = bounds.y + bounds.height;
  const nearX = (value, target) => Math.abs(value - target) <= toleranceX;
  const nearY = (value, target) => Math.abs(value - target) <= toleranceY;
  if (nearX(point.x, left) && nearY(point.y, top)) return "nw";
  if (nearX(point.x, right) && nearY(point.y, top)) return "ne";
  if (nearX(point.x, right) && nearY(point.y, bottom)) return "se";
  if (nearX(point.x, left) && nearY(point.y, bottom)) return "sw";
  if (point.x >= left && point.x <= right && nearY(point.y, top)) return "n";
  if (point.x >= left && point.x <= right && nearY(point.y, bottom)) return "s";
  if (point.y >= top && point.y <= bottom && nearX(point.x, left)) return "w";
  if (point.y >= top && point.y <= bottom && nearX(point.x, right)) return "e";
  return null;
}

function emptySnapGuides() {
  return { vertical: [], horizontal: [] };
}

function nearestSnap(value, targets, tolerance) {
  let best = null;
  targets.forEach(target => {
    const distance = Math.abs(value - target);
    if (distance <= tolerance && (!best || distance < best.distance)) {
      best = { value: target, distance };
    }
  });
  return best;
}

function snapBoundsToCanvas(bounds, canvas, tolerancePx = 10, includeCenter = true) {
  const rect = canvas.getBoundingClientRect();
  const toleranceX = tolerancePx * canvas.width / Math.max(1, rect.width);
  const toleranceY = tolerancePx * canvas.height / Math.max(1, rect.height);
  const xCandidates = [
    { edge: bounds.x, target: 0, offset: 0 },
    { edge: bounds.x + bounds.width, target: canvas.width, offset: bounds.width },
  ];
  const yCandidates = [
    { edge: bounds.y, target: 0, offset: 0 },
    { edge: bounds.y + bounds.height, target: canvas.height, offset: bounds.height },
  ];
  if (includeCenter) {
    xCandidates.push({
      edge: bounds.x + bounds.width / 2,
      target: canvas.width / 2,
      offset: bounds.width / 2,
    });
    yCandidates.push({
      edge: bounds.y + bounds.height / 2,
      target: canvas.height / 2,
      offset: bounds.height / 2,
    });
  }
  const xMatch = xCandidates
    .map(candidate => ({ ...candidate, distance: Math.abs(candidate.edge - candidate.target) }))
    .filter(candidate => candidate.distance <= toleranceX)
    .sort((a, b) => a.distance - b.distance)[0];
  const yMatch = yCandidates
    .map(candidate => ({ ...candidate, distance: Math.abs(candidate.edge - candidate.target) }))
    .filter(candidate => candidate.distance <= toleranceY)
    .sort((a, b) => a.distance - b.distance)[0];
  return {
    x: xMatch ? xMatch.target - xMatch.offset : bounds.x,
    y: yMatch ? yMatch.target - yMatch.offset : bounds.y,
    guides: {
      vertical: xMatch ? [xMatch.target] : [],
      horizontal: yMatch ? [yMatch.target] : [],
    },
  };
}

function drawCanvasSnapGuides(ctx, canvas, guides) {
  if (!guides?.vertical?.length && !guides?.horizontal?.length) return;
  const unit = canvasDisplayUnit(canvas);
  ctx.save();
  ctx.strokeStyle = "#f97316";
  ctx.lineWidth = unit;
  ctx.setLineDash([5 * unit, 5 * unit]);
  guides.vertical.forEach(x => {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, canvas.height);
    ctx.stroke();
  });
  guides.horizontal.forEach(y => {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(canvas.width, y);
    ctx.stroke();
  });
  ctx.restore();
}

function animateMarchingAnts() {
  if (document.hidden) return;
  marchingAntsOffset = (marchingAntsOffset + 1) % 10;
}

function workflowDate() {
  return new Date().toLocaleDateString("sv-SE");
}

function prepareCompletionSound() {
  const AudioContextClass = window.AudioContext || window.webkitAudioContext;
  if (!AudioContextClass) return;
  if (!completionAudioCtx) completionAudioCtx = new AudioContextClass();
  if (completionAudioCtx.state === "suspended") completionAudioCtx.resume().catch(() => {});
}

function playCompletionSound() {
  try {
    prepareCompletionSound();
    if (!completionAudioCtx) return;
    const now = completionAudioCtx.currentTime;
    [
      [0, 660],
      [0.16, 880],
    ].forEach(([offset, frequency]) => {
      const osc = completionAudioCtx.createOscillator();
      const gain = completionAudioCtx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(frequency, now + offset);
      gain.gain.setValueAtTime(0.0001, now + offset);
      gain.gain.exponentialRampToValueAtTime(0.18, now + offset + 0.015);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + offset + 0.18);
      osc.connect(gain).connect(completionAudioCtx.destination);
      osc.start(now + offset);
      osc.stop(now + offset + 0.19);
    });
  } catch (err) {
    console.warn("completion sound failed", err);
  }
}

function showTab(id) {
  annotationState = id === "bg" ? bgAnnotationState : nativeAnnotationState;
  $$(".tabs button").forEach(btn => btn.classList.toggle("active", btn.dataset.tab === id));
  $$(".panel").forEach(panel => panel.classList.toggle("active", panel.id === id));
  if ($("#bgTopbarZoom")) $("#bgTopbarZoom").hidden = id !== "bg";
  if ($("#imageEditorTopbarZoom")) $("#imageEditorTopbarZoom").hidden = id !== "imageEditor";
  if ($("#bgExportButton")) $("#bgExportButton").hidden = id !== "bg";
  if ($("#imageEditorExport")) $("#imageEditorExport").hidden = id !== "imageEditor";
  if (id === "bg") requestAnimationFrame(syncBgMaterialColumnWidth);
  if (id === "imageEditor") scheduleImageEditorInspectorAlign();
  if (id === "distribution") scheduleDistributionScrollAnchors();
  if (id === "distribution" && !state.distribution.loaded && !state.distribution.loading) {
    loadDistributionTasks().catch(err => {
      $("#distributionTaskList").innerHTML = `<div class="distribution-empty">${escapeHtml(err.message)}</div>`;
    });
  }
}

function syncBgMaterialColumnWidth() {
  const workbench = $("#bg .bg-workbench");
  if (!workbench) return;
  if (window.innerWidth <= 900) {
    workbench.style.removeProperty("--bg-material-column-width");
    return;
  }
  // Keep the material pane stable across the local toolbox and the two-tab
  // online shell. Deriving this width from a navigation button made the
  // online pane expand across the viewport when its tabs were right-aligned.
  const width = Math.round(Math.min(360, Math.max(240, window.innerWidth * 0.18)));
  workbench.style.setProperty("--bg-material-column-width", `${width}px`);
}

async function api(path, payload) {
  let res;
  try {
    res = await fetch(path, {
      method: payload ? "POST" : "GET",
      headers: payload ? { "Content-Type": "application/json" } : undefined,
      body: payload ? JSON.stringify(payload) : undefined,
    });
  } catch (err) {
    throw new Error(`无法连接本地工具服务。请确认页面是从 http://127.0.0.1:8765 打开的，并且 server.py 正在运行。原始错误：${err.message}`);
  }
  const text = await res.text();
  let data = {};
  try {
    data = text ? JSON.parse(text) : {};
  } catch (err) {
    if (!res.ok) throw new Error(text || res.statusText);
    throw new Error(`接口返回格式异常：${text.slice(0, 120)}`);
  }
  if (!res.ok) throw new Error(data.error || res.statusText);
  return data;
}

async function fetchBlob(path, options) {
  let res;
  try {
    res = await fetch(path, options);
  } catch (err) {
    throw new Error(`无法连接本地工具服务。请确认页面是从 http://127.0.0.1:8765 打开的，并且 server.py 正在运行。原始错误：${err.message}`);
  }
  if (!res.ok) throw new Error(await res.text());
  return res.blob();
}

async function shutdownToolbox() {
  const btn = $("#shutdownToolbox");
  if (!confirm("关闭当前中控台标签页，并停止本地后台服务？")) return;
  btn.disabled = true;
  btn.textContent = "正在关闭...";
  try {
    await api("/api/shutdown", {});
  } catch (err) {
    // The server may close before the browser finishes reading the response.
    console.warn(err);
  }

  window.open("", "_self");
  window.close();
  setTimeout(() => {
    document.body.innerHTML = '<main class="shutdown-message"><h1>后台服务已关闭</h1><p>如果这个标签页没有自动关闭，可以手动关闭它。</p></main>';
  }, 250);
}

async function loadTasks() {
  const data = await api(state.taskSource === "wp" ? "/api/wp-tasks" : "/api/tasks");
  state.tasks = data.tasks || [];
  if (data.error) $("#packageResult").textContent = data.error;
  updateTaskSourceUi();
  renderTasks();
}

async function loadSettings() {
  const data = await api("/api/settings");
  state.settings = data;
  const input = $("#downloadDir");
  const saved = localStorage.getItem(DOWNLOAD_DIR_KEY) || "";
  input.value = saved || data.defaultDownloadDir || "";
  input.placeholder = data.platform === "win32" ? "C:\\Users\\用户名\\Downloads" : "/Users/用户名/Downloads";
}

function renderTasks() {
  const q = $("#taskSearch").value.trim().toLowerCase();
  const list = $("#taskList");
  const completedList = $("#completedTaskList");
  const skippedList = $("#skippedTaskList");
  const allTasks = [...(state.taskSource === "wechat" ? state.manualTasks : []), ...state.tasks];
  const activeTasks = allTasks.filter(task => !isTaskCompleted(task) && !isTaskSkipped(task));
  const completedTasks = allTasks.filter(task => isTaskCompleted(task));
  const skippedTasks = allTasks.filter(task => isTaskSkipped(task));
  list.innerHTML = "";
  completedList.innerHTML = "";
  skippedList.innerHTML = "";
  $("#taskCount").textContent = `(${activeTasks.length} 篇)`;
  $("#completedCount").textContent = `(${completedTasks.length} 篇)`;
  $("#skippedCount").textContent = `(${skippedTasks.length} 篇)`;
  activeTasks
    .filter(task => !q || task.title.toLowerCase().includes(q))
    .forEach(task => list.appendChild(taskRow(task, "active")));
  completedTasks
    .filter(task => !q || task.title.toLowerCase().includes(q))
    .forEach(task => completedList.appendChild(taskRow(task, "completed")));
  skippedTasks
    .filter(task => !q || task.title.toLowerCase().includes(q))
    .forEach(task => skippedList.appendChild(taskRow(task, "skipped")));
}

function taskRow(task, mode) {
  const div = document.createElement("div");
  const key = taskKey(task);
  div.dataset.taskKey = key;
  div.className = "task" + (taskKey(state.selectedTask) === key ? " active" : "") + (mode === "completed" || mode === "skipped" ? " completed" : "") + (state.revealTaskKey === key ? " reveal" : "");
  const actionLabel = mode === "active" ? "完成" : "恢复";
  const skipButton = mode === "active" ? '<button class="task-skip" type="button">不处理</button>' : "";
  const sourceLink = task.url
    ? `<a class="task-source" href="${escapeAttr(task.url || "#")}" target="_blank" rel="noopener" title="打开公众号原文">原文</a>`
    : `<a class="task-source" href="${escapeAttr(task.localUrl || "#")}" target="_blank" rel="noopener" title="打开 WordPress 原文">原文</a>`;
  const publishLink = mode === "completed" && task.publishUrl
    ? `<a class="task-publish" href="${escapeAttr(task.publishUrl)}" target="_blank" rel="noopener" title="打开这篇文章的发布信息">发布信息</a>`
    : "";
  const articleLink = mode === "completed" && task.articleUrl
    ? `<a class="task-article" href="${escapeAttr(task.articleUrl)}" target="_blank" rel="noopener" title="打开线上文章">链接</a>`
    : "";
  const metaReads = task.reads ? ` · ${task.reads} 阅读` : "";
  const statusText = task.status && task.status !== "pending" ? ` · ${task.status}` : "";
  const productText = task.manualProduct ? ` · 商品：${task.manualProduct}` : "";
  div.innerHTML = `<div class="task-main">
      <div class="task-title">${escapeHtml(task.title)}</div>
      <div class="task-meta">${task.date || workflowDate()} · ${task.type || "手动"}${metaReads}${statusText}${escapeHtml(productText)}</div>
    </div>
    ${sourceLink}
    ${publishLink}
    ${articleLink}
    ${skipButton}
    <button class="task-done" type="button">${actionLabel}</button>`;
  div.onclick = () => mode === "active" ? selectTask(task) : null;
  $(".task-source", div).onclick = event => event.stopPropagation();
  const publishEl = $(".task-publish", div);
  if (publishEl) publishEl.onclick = event => event.stopPropagation();
  const skipEl = $(".task-skip", div);
  if (skipEl) {
    skipEl.onclick = event => {
      event.stopPropagation();
      skipTask(task).catch(err => $("#packageResult").textContent = err.message);
    };
  }
  $(".task-done", div).onclick = event => {
    event.stopPropagation();
    if (mode === "completed" || mode === "skipped") restoreTask(task).catch(err => $("#packageResult").textContent = err.message);
    else completeTask(task).catch(err => $("#packageResult").textContent = err.message);
  };
  return div;
}

async function editWpManualProduct(task) {
  const current = task.manualProduct || "";
  const value = prompt(
    "请输入这篇 WP 文章要插入商品按钮的软件名或数码荔枝商品页链接。\n留空并确认 = 清除手动指定，继续按标题自动匹配。",
    current
  );
  if (value === null) return;
  const manualProduct = value.trim();
  await api("/api/wp-manual-product", {
    articleId: task.articleId,
    manualProduct,
  });
  $("#packageResult").textContent = manualProduct
    ? `已为「${task.title}」指定商品：${manualProduct}`
    : `已清除「${task.title}」的手动商品指定，将按默认规则处理。`;
  await loadTasks();
}

function taskKey(task) {
  return task ? (task.taskKey || `${task.sourceKind || state.taskSource}\n${task.articleId || ""}\n${task.date || ""}\n${task.title || ""}\n${task.url || ""}`) : "";
}

function isTaskCompleted(task) {
  return state.completedKeys.has(taskKey(task)) || ["ready", "cover-selected", "completed"].includes(task?.status || "");
}

function isTaskSkipped(task) {
  return state.skippedKeys.has(taskKey(task)) || task?.status === "skipped";
}

function updateTaskSourceUi() {
  const isWp = state.taskSource === "wp";
  $("#reloadTasks").textContent = isWp ? "切换到公众号文章" : "切换到 WP 文章";
  $("#taskSourceLabel").textContent = isWp ? "WordPress 文章" : "公众号文章";
  $(".manual-task-row").style.display = isWp ? "none" : "";
  $("#downloadDir").closest("label").style.display = isWp ? "none" : "";
  $("#callAi").style.display = isWp ? "none" : "";
}

async function toggleTaskSource() {
  state.taskSource = state.taskSource === "wp" ? "wechat" : "wp";
  localStorage.setItem(TASK_SOURCE_KEY, state.taskSource);
  state.selectedTask = null;
  clearPackageWorkspace();
  await loadTasks();
}

function normalizeTaskUrl(url) {
  const raw = String(url || "").trim().replace(/&amp;/g, "&");
  try {
    const parsed = new URL(raw);
    const host = parsed.hostname.toLowerCase();
    if (host === "mp.weixin.qq.com" && parsed.pathname === "/s") {
      const parts = ["__biz", "mid", "idx", "sn"]
        .map(name => `${name}=${parsed.searchParams.get(name) || ""}`)
        .join("&");
      return `mp.weixin.qq.com/s?${parts}`;
    }
    parsed.protocol = parsed.protocol.toLowerCase();
    parsed.hostname = host;
    parsed.hash = "";
    parsed.searchParams.sort();
    return parsed.toString().replace(/\/$/, "");
  } catch {
    return raw.replace(/#.*$/, "").replace(/\/$/, "");
  }
}

function findTaskByUrl(url) {
  const normalized = normalizeTaskUrl(url);
  const allTasks = [...state.manualTasks, ...state.tasks];
  const task = allTasks.find(item => normalizeTaskUrl(item.url) === normalized);
  if (!task) return null;
  const key = taskKey(task);
  const listName = isTaskCompleted(task) ? "已完成" : isTaskSkipped(task) ? "不处理" : "当前任务";
  return { task, key, listName };
}

function revealTask(task, message) {
  const key = taskKey(task);
  state.selectedTask = task;
  state.revealTaskKey = key;
  $("#taskSearch").value = "";
  renderTasks();
  requestAnimationFrame(() => {
    const row = document.querySelector(`[data-task-key="${CSS.escape(key)}"]`);
    if (row) row.scrollIntoView({ behavior: "smooth", block: "center" });
  });
  $("#packageResult").textContent = message;
  setTimeout(() => {
    if (state.revealTaskKey === key) {
      state.revealTaskKey = "";
      renderTasks();
    }
  }, 2200);
}

function selectTask(task) {
  if (taskKey(state.selectedTask) !== taskKey(task)) {
    clearPackageWorkspace();
  }
  state.selectedTask = task;
  renderTasks();
}

function loadLocalTaskState() {
  state.taskSource = localStorage.getItem(TASK_SOURCE_KEY) === "wp" ? "wp" : "wechat";
  try {
    state.manualTasks = JSON.parse(localStorage.getItem(MANUAL_TASKS_KEY) || "[]");
  } catch {
    state.manualTasks = [];
  }
  try {
    state.completedKeys = new Set(JSON.parse(localStorage.getItem(COMPLETED_TASKS_KEY) || "[]"));
  } catch {
    state.completedKeys = new Set();
  }
  try {
    state.skippedKeys = new Set(JSON.parse(localStorage.getItem(SKIPPED_TASKS_KEY) || "[]"));
  } catch {
    state.skippedKeys = new Set();
  }
}

function saveManualTasks() {
  localStorage.setItem(MANUAL_TASKS_KEY, JSON.stringify(state.manualTasks));
}

function saveCompletedTasks() {
  localStorage.setItem(COMPLETED_TASKS_KEY, JSON.stringify([...state.completedKeys]));
}

function saveSkippedTasks() {
  localStorage.setItem(SKIPPED_TASKS_KEY, JSON.stringify([...state.skippedKeys]));
}

async function addManualTask() {
  let title = $("#manualTitle").value.trim();
  const url = $("#manualUrl").value.trim();
  if (!url) {
    $("#packageResult").textContent = "请填写公众号原文 URL。";
    return;
  }
  const existing = findTaskByUrl(url);
  if (existing) {
    revealTask(existing.task, `该文章已经在「${existing.listName}」列表中：${existing.task.title}`);
    return;
  }
  if (!title) {
    $("#packageResult").textContent = "正在自动读取文章标题...";
    const data = await api("/api/article-title", { url });
    title = data.title || "";
    if (!title) {
      $("#packageResult").textContent = "没有读取到标题，请手动填写文章标题。";
      return;
    }
  }
  const task = { title, url, date: workflowDate(), type: "手动", reads: 0, manual: true };
  const key = taskKey(task);
  state.manualTasks = state.manualTasks.filter(item => taskKey(item) !== key);
  state.manualTasks.unshift(task);
  state.completedKeys.delete(key);
  state.skippedKeys.delete(key);
  saveManualTasks();
  saveCompletedTasks();
  saveSkippedTasks();
  $("#manualTitle").value = "";
  $("#manualUrl").value = "";
  selectTask(task);
}

async function persistTaskStatus(task, status) {
  await api("/api/task-status", {
    taskKey: taskKey(task),
    sourceKind: task.sourceKind || state.taskSource,
    articleId: task.articleId || "",
    date: task.date || "",
    title: task.title || "",
    url: task.url || "",
    status,
  });
}

async function completeTask(task) {
  const key = taskKey(task);
  state.completedKeys.add(key);
  state.skippedKeys.delete(key);
  task.status = "completed";
  if (taskKey(state.selectedTask) === taskKey(task)) {
    state.selectedTask = null;
    clearPackageWorkspace();
  }
  saveCompletedTasks();
  saveSkippedTasks();
  await persistTaskStatus(task, "completed");
  await loadTasks();
  renderTasks();
}

async function skipTask(task) {
  const key = taskKey(task);
  state.skippedKeys.add(key);
  state.completedKeys.delete(key);
  task.status = "skipped";
  if (taskKey(state.selectedTask) === key) {
    state.selectedTask = null;
    clearPackageWorkspace();
  }
  saveSkippedTasks();
  saveCompletedTasks();
  await persistTaskStatus(task, "skipped");
  await loadTasks();
  renderTasks();
}

async function restoreTask(task) {
  const key = taskKey(task);
  if ((task.sourceKind || state.taskSource) === "wp" && task.articleId) {
    await api("/api/wp-reset", { articleId: task.articleId });
    await loadTasks();
  }
  state.completedKeys.delete(key);
  state.skippedKeys.delete(key);
  await persistTaskStatus(task, "pending");
  saveCompletedTasks();
  saveSkippedTasks();
  await loadTasks();
  renderTasks();
}

function clearPackageWorkspace() {
  $("#aiText").value = "";
  $("#optimizedMarkdown").value = "";
  $("#packageResult").textContent = "";
}

async function callAi() {
  const task = state.selectedTask;
  if (!task) throw new Error("请先选择一篇文章");
  const downloadDir = $("#downloadDir").value.trim();
  if (!downloadDir) throw new Error("请填写下载目录路径");
  $("#packageResult").textContent = "正在调用 AI...";
  const source = await fetchSourceMarkdown(downloadDir);
  const data = await api("/api/openrouter", {
    model: $("#model").value.trim(),
    downloadDir,
    markdown: source,
    title: task.title,
    workflowDate: workflowDate(),
  });
  $("#aiText").value = `# Stage 1\n\n${data.stage1 || ""}\n\n# Stage 2\n\n${data.stage2 || ""}`;
  if (data.optimizedMarkdown) $("#optimizedMarkdown").value = data.optimizedMarkdown;
  if (data.fields?.utm_campaign) $("#campaign").value = data.fields.utm_campaign;
  $("#packageResult").textContent = "AI 两阶段输出已填入，优化后 Markdown 已自动提取。请检查后生成发布包。";
}

async function fetchSourceMarkdown(downloadDir) {
  // 后端生成包时会读取目录；前端无法直接读任意路径，所以这里返回空串并让用户可粘贴。
  return $("#optimizedMarkdown").value.trim();
}

async function buildPackage() {
  if (state.taskSource === "wp") {
    await buildWpPackage();
    return;
  }
  let progress;
  try {
    const task = state.selectedTask;
    if (!task) throw new Error("请先选择一篇文章");
    const basePayload = {
      title: task.title,
      date: task.date,
      sourceUrl: task.url,
      downloadDir: $("#downloadDir").value.trim(),
      model: $("#model").value.trim(),
      bgScale: Number($("#bgScale")?.value || 90),
      workflowDate: workflowDate(),
    };
    progress = createProgress(task.title, [
      "创建单篇项目文件夹",
      "检测本地项目资源",
      "导入 Markdown、封面图、正文图片",
      "调用 AI 进行 SEO 优化",
      "提取 URL、跟踪参数、摘要",
      "生成官网版本正文与发布页",
    ]);

    progress.set(0, "active");
    progress.message("正在处理：" + task.title);
    progress.set(1, "active");
    const initial = await api("/api/package", { ...basePayload, autoAi: false, probeOnly: true });
    progress.set(0, "done");
    progress.set(1, initial.status === "pending-download" ? "error" : "done");
    if (initial.status === "pending-download") {
      renderPackageResult(initial);
      progress.waitForDownload(
        `下载目录里还没有找到这篇文章的 Markdown。\n已创建本地项目文件夹：${initial.downloadProjectDir || ""}\n请打开公众号原文，用油猴脚本下载；下载完成后回到这里点击「已完成下载」。`,
        [
        { label: "打开公众号原文", href: initial.sourceUrl },
        ],
        () => continuePackage(progress, basePayload, task)
      );
      return;
    }

    progress.set(2, "done");
    await finishPackage(progress, basePayload, task);
  } catch (err) {
    if (progress) {
      progress.fail(err.message);
    } else {
      $("#packageResult").textContent = err.message;
    }
  }
}

async function buildWpPackage() {
  let progress;
  try {
    const task = state.selectedTask;
    if (!task) throw new Error("请先选择一篇 WordPress 文章");
    progress = createProgress(task.title, [
      "提交 WordPress 迁移任务",
      "后端完整处理：图片、链接、SEO、封面、压缩与回填",
      "生成发布包并更新迁移进度",
    ]);
    progress.set(0, "active");
    progress.message(`正在处理：${task.title}\n当前步骤：读取 WordPress Markdown。`);
    progress.set(0, "done");
    progress.set(1, "active");
    progress.message(`正在处理：${task.title}\n当前步骤：后端完整处理，包含链接检查、AI SEO、模板封面、Zipic 压缩和下载目录回填，可能需要几十秒。`);
    const data = await api("/api/wp-package", {
      articlePath: task.articlePath,
      model: $("#model").value.trim(),
      downloadDir: $("#downloadDir").value.trim(),
      manualProduct: task.manualProduct || "",
      workflowDate: workflowDate(),
    });
    progress.set(1, "done");
    progress.set(2, "done");
    renderPackageResult(data);
    await loadTasks();
    playCompletionSound();
    progress.complete(
      "WordPress 发布包已生成，可以打开发布页检查和复制正文。",
      packageCompleteActions(data, text => progress.message(text))
    );
  } catch (err) {
    if (progress) progress.fail(err.message);
    else $("#packageResult").textContent = err.message;
  }
}

async function continuePackage(progress, basePayload, task) {
  try {
    progress.disableActions();
    progress.set(1, "active");
    progress.message("正在重新检测下载目录，准备继续生成发布包。");
    const data = await api("/api/package", { ...basePayload, autoAi: false, probeOnly: true });
    if (data.status === "pending-download") {
      renderPackageResult(data);
      progress.set(1, "error");
      progress.waitForDownload(
        "仍然没有找到这篇文章的 Markdown。请确认油猴脚本已经下载完成，然后再点「已完成下载」。",
        [
          { label: "打开公众号原文", href: data.sourceUrl },
        ],
        () => continuePackage(progress, basePayload, task)
      );
      return;
    }
    progress.set(1, "done");
    progress.set(2, "done");
    await finishPackage(progress, basePayload, task);
  } catch (err) {
    progress.fail(err.message);
  }
}

async function finishPackage(progress, basePayload, task) {
    let aiText = $("#aiText").value;
    let optimizedMarkdown = $("#optimizedMarkdown").value;
    if (!aiText && !optimizedMarkdown) {
      progress.set(3, "active");
      progress.message(`正在处理：${task.title}\n当前步骤：调用 AI 进行 SEO 优化，可能需要几十秒。`);
      const ai = await api("/api/openrouter", {
        model: basePayload.model,
        downloadDir: basePayload.downloadDir,
        title: task.title,
        date: task.date,
      });
      aiText = `# Stage 1\n\n${ai.stage1 || ""}\n\n# Stage 2\n\n${ai.stage2 || ""}`;
      optimizedMarkdown = ai.optimizedMarkdown || "";
      $("#aiText").value = aiText;
      $("#optimizedMarkdown").value = optimizedMarkdown;
      if (ai.fields?.utm_campaign) $("#campaign").value = ai.fields.utm_campaign;
      progress.set(3, "done");
      progress.set(4, "done");
    } else {
      progress.set(3, "done");
      progress.set(4, "done");
    }

    progress.set(5, "active");
    progress.message(`正在处理：${task.title}\n当前步骤：生成官网版本正文与发布页。`);
    const finalPayload = {
      ...basePayload,
      aiText: $("#aiText").value,
      optimizedMarkdown: $("#optimizedMarkdown").value,
      autoAi: false,
    };
    const data = await api("/api/package", finalPayload);
    progress.set(5, "done");
    renderPackageResult(data);
    playCompletionSound();
    progress.complete(
      "发布包已生成，可以打开发布页检查和复制正文。",
      packageCompleteActions(data, text => progress.message(text))
    );
}

function packageCompleteActions(data, status) {
  return [{ label: "打开 publish.html", href: data.publishUrl }];
}

function createProgress(title, steps) {
  $("#progressOverlay")?.remove();
  const overlay = document.createElement("div");
  overlay.id = "progressOverlay";
  overlay.className = "progress-overlay";
  overlay.innerHTML = `
    <div class="progress-dialog" role="dialog" aria-modal="true" aria-labelledby="progressTitle">
      <h2 id="progressTitle">正在生成发布包</h2>
      <pre id="progressMessage">正在处理：${escapeHtml(title)}</pre>
      <ul class="progress-list">
        ${steps.map(step => `<li class="pending">${escapeHtml(step)}</li>`).join("")}
      </ul>
      <div id="progressActions" class="progress-actions"></div>
      <button id="closeProgress" class="progress-close" disabled aria-label="关闭">
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M6 6l12 12M18 6L6 18"></path>
        </svg>
      </button>
    </div>
  `;
  document.body.appendChild(overlay);
  $("#packageResult").textContent = "任务执行中，请在中央进度窗口查看当前状态。";
  const items = $$(".progress-list li", overlay);
  const close = $("#closeProgress", overlay);
  close.onclick = () => overlay.remove();
  return {
    set(index, stateName) {
      if (!items[index]) return;
      items[index].className = stateName;
    },
    message(text) {
      $("#progressMessage").textContent = text;
    },
    complete(text, actions = []) {
      this.message(text);
      renderProgressActions(actions, $("#progressActions", overlay));
      close.disabled = false;
      close.focus();
    },
    waitForDownload(text, actions = [], onContinue) {
      this.message(text);
      renderProgressActions(
        [
          ...actions,
          { label: "已完成下载", onClick: onContinue, primary: true },
        ],
        $("#progressActions", overlay)
      );
      close.disabled = false;
    },
    disableActions() {
      $$(".progress-action", overlay).forEach(action => {
        action.disabled = true;
        action.classList.add("disabled");
      });
    },
    fail(text) {
      const active = items.find(item => item.classList.contains("active"));
      if (active) active.className = "error";
      this.message("处理失败：" + text);
      renderProgressActions([], $("#progressActions", overlay));
      close.disabled = false;
      close.focus();
    },
  };
}

function renderProgressActions(actions, target) {
  target.innerHTML = "";
  actions.forEach(action => {
    if (action.href) {
      const link = document.createElement("a");
      link.className = "progress-action";
      link.href = action.href;
      link.target = "_blank";
      link.rel = "noopener";
      link.textContent = action.label;
      target.appendChild(link);
      return;
    }
    if (action.onClick) {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "progress-action" + (action.primary ? " primary" : "");
      button.textContent = action.label;
      button.onclick = async () => {
        try {
          button.disabled = true;
          await action.onClick();
        } catch (err) {
          alert(err.message || String(err));
        } finally {
          button.disabled = false;
        }
      };
      target.appendChild(button);
    }
  });
}

function renderPackageResult(data) {
  if (data.status === "pending-download") {
    $("#packageResult").innerHTML = `
      <div><strong>需要先下载原文</strong></div>
      <div>本地项目文件夹已创建。请点击进度窗口里的「打开公众号原文」下载，下载完成后点击「已完成下载」。</div>
      <div class="result-actions">
        <a href="${escapeAttr(data.sourceUrl || "#")}" target="_blank" rel="noopener">打开公众号原文</a>
      </div>
    `;
    return;
  }
  $("#packageResult").innerHTML = `
    <div><strong>发布包已生成</strong></div>
    ${data.originalTitle ? `<div>原标题：${escapeHtml(data.originalTitle)}</div>` : ""}
    <div>图片：${data.imageCount || 0} 张，封面：${data.coverCount || 0} 张</div>
    ${data.imageDownloads && data.imageDownloads.downloaded && data.imageDownloads.downloaded.length ? `<div>远程原图：成功下载 ${data.imageDownloads.downloaded.length} 张</div>` : ""}
    ${data.imageDownloads && data.imageDownloads.missing && data.imageDownloads.missing.length ? `<div class="result-error">有 ${data.imageDownloads.missing.length} 张原文图片下载失败：${data.imageDownloads.missing.map(item => `图 ${escapeHtml(String(item.slot || ""))}（${escapeHtml(item.reason || "未知错误")}）`).join("；")}。详细地址见图片下载失败清单.txt。</div>` : ""}
    ${data.coverGeneration && data.coverGeneration.mode === "ai" ? `<div>封面：已使用 ${escapeHtml(data.coverGeneration.model || "AI 图像模型")} 生成</div>` : ""}
    ${data.coverGeneration && data.coverGeneration.mode === "template" ? `<div>封面：已使用本地模板生成</div>` : ""}
    ${data.coverGeneration && data.coverGeneration.mode === "fallback-template" ? `<div class="result-error">AI 封面生成失败，已回退模板封面：${escapeHtml(data.coverGeneration.error || "")}</div>` : ""}
    ${data.media ? `<div>自动加底：${data.media.backgroundsGenerated || 0} 张；购买按钮：${data.media.purchaseButtonsGenerated || 0} 张，待处理：${data.media.purchaseButtonsPending || 0} 张；Zipic：${data.media.zipicLargeImages || 0} 张（静态 ${data.media.zipicStaticImages || 0}，GIF ${data.media.zipicGifImages || 0}，原超限 ${data.media.zipicOverLimitImages || 0}，WebP ${data.media.zipicWebpImages || 0}）${data.media.zipicLargeImages ? (data.media.zipicLaunched ? "，已调用" : "，调用失败") : ""}</div>` : ""}
    ${data.media && data.media.zipicLargeImages && !data.media.zipicCompleted ? `<div class="result-error">Zipic 压缩未完成：${(data.media.zipicOverLimitAfterCompression || []).length} 张图片仍超过限制。请查看 8 media-report.json。</div>` : ""}
    ${data.media && data.media.zipicErrors && data.media.zipicErrors.length ? `<div class="result-error">Zipic 错误：${escapeHtml(data.media.zipicErrors.join("；"))}</div>` : ""}
    <div class="result-actions">
      <a href="${escapeAttr(data.publishUrl || "#")}" target="_blank" rel="noopener">打开 publish.html</a>
    </div>
  `;
}

function genLinks() {
  const url = $("#linkUrl").value.trim().split("?")[0].split("#")[0];
  const campaign = $("#campaign").value.trim();
  const other = $("#otherMedium").value.trim();
  if (!/^https?:\/\//i.test(url)) throw new Error("URL 必须以 http 或 https 开头");
  const isLizhi = url.includes("lizhi.shop");
  const buildParams = medium => ({
    utm_source: "lizhi-shop",
    ...(campaign ? { utm_campaign: campaign } : {}),
    ...(medium ? { utm_medium: medium } : {}),
  });
  const buildLizhi = medium => withParams(url, { cid: CID, ...buildParams(medium) });
  const buildExternal = medium => withParams(url, buildParams(medium));
  const build = isLizhi ? buildLizhi : buildExternal;
  const rows = [
    { type: "site", url: isLizhi ? withParams(url, { cid: CID }) : withParams(url, { utm_source: "lizhi-shop" }) },
    { type: "wechat", url: build("wechat") },
    { type: "wechat-hmpl", url: withParams(url, { cid: CID, hmsr: "wechat", hmpl: `p${trackingDatePart()}` }) },
    { type: "email", url: build("email") },
    { type: "twitter", url: build("twitter") },
  ];
  if (other) rows.push({ type: other, url: build(other) });
  renderLinksTable(rows);
}

function withParams(rawUrl, params) {
  const parsed = new URL(rawUrl);
  parsed.search = "";
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") parsed.searchParams.set(key, value);
  });
  return parsed.toString();
}

function trackingDatePart() {
  const [year, month, day] = workflowDate().split("-");
  return `${year.slice(-2)}${month}${day}`;
}

function renderLinksTable(rows) {
  const result = $("#linksResult");
  result.textContent = "";
  result.classList.add("links-result-table");
  const table = document.createElement("table");
  table.className = "links-table";
  table.innerHTML = `
    <thead>
      <tr>
        <th>类型</th>
        <th>链接</th>
        <th>操作</th>
      </tr>
    </thead>
  `;
  const body = document.createElement("tbody");
  rows.forEach(row => {
    const tr = document.createElement("tr");
    const typeCell = document.createElement("td");
    const linkCell = document.createElement("td");
    const actionCell = document.createElement("td");
    const link = document.createElement("a");
    const button = document.createElement("button");

    typeCell.textContent = row.type;
    link.href = row.url;
    link.target = "_blank";
    link.rel = "noopener";
    link.textContent = row.url;
    button.type = "button";
    button.className = "link-copy";
    button.dataset.link = row.url;
    button.textContent = "复制";

    linkCell.appendChild(link);
    actionCell.appendChild(button);
    tr.append(typeCell, linkCell, actionCell);
    body.appendChild(tr);
  });
  table.appendChild(body);
  result.appendChild(table);
}

function withProductCid(rawUrl) {
  const parsed = new URL(rawUrl);
  parsed.searchParams.set("cid", CID);
  return parsed.toString();
}

function processMdLinks() {
  const campaign = $("#campaign").value.trim();
  let md = $("#mdForLinks").value;
  md = md.replace(/!\[[^\]]*]\(([^)]+\.(?:png|jpe?g|gif|webp))\)/gi, (_, path) => {
    const file = path.split("/").pop().replace(/\.[^.]+$/, "");
    return `【${file}】`;
  });
  md = md.replace(/\[([^\]]*)]\((https?:\/\/[^)]*lizhi\.shop[^)]*)\)/gi, (_, text, link) => {
    const clean = link.split("?")[0];
    return `[${text}](${clean}?cid=${CID}&utm_source=lizhi-shop${campaign ? `&utm_campaign=${campaign}` : ""}&utm_medium=wechat)`;
  });
  md = md.replace(/\[([^\]]*)]\((https?:\/\/(?![^)]*lizhi\.shop)[^)]*)\)/gi, (_, text, link) => {
    const sep = link.includes("?") ? "&" : "?";
    return `[${text}](${link}${sep}utm_source=lizhi-shop)`;
  });
  $("#linksResult").classList.remove("links-result-table");
  $("#linksResult").textContent = md;
}

async function copyLinkFromButton(button) {
  const text = button.dataset.link || "";
  const originalText = button.textContent;
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
    } else {
      const textarea = document.createElement("textarea");
      textarea.value = text;
      textarea.setAttribute("readonly", "");
      textarea.style.position = "fixed";
      textarea.style.opacity = "0";
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      textarea.remove();
    }
    button.textContent = "已复制";
    button.classList.add("copied");
  } catch (err) {
    button.textContent = "复制失败";
    console.warn("copy link failed", err);
  } finally {
    setTimeout(() => {
      button.textContent = originalText;
      button.classList.remove("copied");
    }, 1400);
  }
}

async function makeShort(action) {
  const apiUrl = $("#yourlsApi").value.trim();
  const token = $("#yourlsToken").value.trim();
  const input = $("#shortInput").value.trim();
  const keyword = $("#shortKeyword").value.trim();
  const params = new URLSearchParams({
    signature: token,
    action,
    format: "json",
  });
  if (action === "shorturl") {
    params.set("url", input);
    if (keyword) params.set("keyword", keyword);
  } else {
    params.set("shorturl", input.replace(/^https?:\/\/go\.lizhi\.shop\//, ""));
  }
  const res = await fetch(`${apiUrl}?${params}`);
  const data = await res.json();
  $("#shortResult").textContent = JSON.stringify(data, null, 2);
}

function blueBgCanvas() {
  return $("#blueBgCanvas");
}

function blueBgStatus(message) {
  $("#blueBgStatus").textContent = message;
}

function applyBlueBgZoom(zoom) {
  if (!blueBgState.canvasWidth || !blueBgState.baseDisplayWidth) return;
  const canvas = blueBgCanvas();
  blueBgState.zoom = Math.max(0.5, Math.min(20, zoom));
  // 宽、高缓存可能来自标签切换前的异步布局。不能分别套用两个缓存值，
  // 否则在下一次完整重绘前会把 canvas 和标注层压扁。统一换算为同一个
  // 显示比例，任何时序下都严格保持画布固有宽高比。
  const baseScale = Math.min(
    blueBgState.baseDisplayWidth / Math.max(1, canvas.width),
    blueBgState.baseDisplayHeight / Math.max(1, canvas.height)
  );
  const displayScale = baseScale * blueBgState.zoom;
  canvas.style.width = `${canvas.width * displayScale}px`;
  canvas.style.height = `${canvas.height * displayScale}px`;
  canvas.style.imageRendering = blueBgState.zoom >= 4 ? "pixelated" : "auto";
  const annotationOverlay = syncBgAnnotationBox(canvas);
  if (annotationOverlay) {
    annotationOverlay.style.imageRendering = canvas.style.imageRendering;
  }
  $("#blueBgStage").classList.toggle("at-base-zoom", blueBgState.zoom <= 1.001);
  const zoomPercent = Math.round(blueBgState.zoom * 100);
  if ($("#bgCanvasZoom")) $("#bgCanvasZoom").value = String(zoomPercent);
  if ($("#bgCanvasZoomValue")) $("#bgCanvasZoomValue").textContent = `${zoomPercent}%`;
  requestAnimationFrame(() => {
    syncCanvasSelectionOverlays(
      $("#blueBgStage"),
      canvas,
      $("#blueBgSelectionOverlay"),
      blueBgSelectionEntries()
    );
    withAnnotationState(bgAnnotationState, () => {
      renderAnnotationCanvas(
        blueBgState.toolMode === "annotation" || selectedAnnotationItems().length > 0
      );
    });
  });
}

// 重新测量「100% 时的显示尺寸」，再把画布恢复到 targetZoom。
// 切换画布标签时会带上该标签自己的缩放比例，避免切回来缩放被重置。
// preserveView：重新测量期间画布会先缩回原始尺寸，浏览器会把滚动位置夹小，
// 撤销 / 重做回放历史时用它把用户的画面位置原样放回去。
function resetBlueBgZoom(targetZoom = 1, { preserveView = false } = {}) {
  const state = blueBgState;
  const canvas = blueBgCanvas();
  const stage = $("#blueBgStage");
  const scrollLeft = preserveView ? stage?.scrollLeft || 0 : 0;
  const scrollTop = preserveView ? stage?.scrollTop || 0 : 0;
  canvas.style.width = "";
  canvas.style.height = "";
  canvas.style.maxWidth = "";
  canvas.style.maxHeight = "";
  const annotationOverlay = $("#bgAnnotationCanvas");
  if (annotationOverlay) {
    annotationOverlay.style.width = "";
    annotationOverlay.style.height = "";
    annotationOverlay.style.maxWidth = "";
    annotationOverlay.style.maxHeight = "";
  }
  const zoom = Math.max(0.5, Math.min(20, Number(targetZoom) || 1));
  state.zoom = zoom;
  state.baseDisplayWidth = 0;
  state.baseDisplayHeight = 0;
  requestAnimationFrame(() => {
    if (state !== blueBgState || !state.canvasWidth) return;
    const rect = canvas.getBoundingClientRect();
    const baseScale = Math.min(
      rect.width / Math.max(1, canvas.width),
      rect.height / Math.max(1, canvas.height)
    );
    state.baseDisplayWidth = canvas.width * baseScale;
    state.baseDisplayHeight = canvas.height * baseScale;
    canvas.style.maxWidth = "none";
    canvas.style.maxHeight = "none";
    // 标注层的约束要跟画布一起放开，否则它会被 CSS 的 max-height 压扁。
    syncBgAnnotationBox(canvas);
    applyBlueBgZoom(zoom);
    if (preserveView && stage) {
      stage.scrollLeft = scrollLeft;
      stage.scrollTop = scrollTop;
    }
  });
}

function setBlueBgZoomAtPoint(nextZoom, clientX, clientY) {
  const stage = $("#blueBgStage");
  const canvas = blueBgCanvas();
  const before = canvas.getBoundingClientRect();
  const relativeX = before.width ? Math.max(0, Math.min(1, (clientX - before.left) / before.width)) : 0.5;
  const relativeY = before.height ? Math.max(0, Math.min(1, (clientY - before.top) / before.height)) : 0.5;
  applyBlueBgZoom(nextZoom);
  const after = canvas.getBoundingClientRect();
  stage.scrollLeft += after.left + relativeX * after.width - clientX;
  stage.scrollTop += after.top + relativeY * after.height - clientY;
  blueBgStatus(`画布缩放 ${Math.round(blueBgState.zoom * 100)}% · 共 ${blueBgState.layers.length} 张图片`);
}

function blueBgWheel(event) {
  if (!blueBgState.canvasWidth || !event.ctrlKey) return;
  event.preventDefault();
  setBlueBgZoomAtPoint(blueBgState.zoom * Math.exp(-event.deltaY * 0.01), event.clientX, event.clientY);
}

function blueBgGestureStart(event) {
  if (!blueBgState.canvasWidth) return;
  event.preventDefault();
  blueBgState.gestureStartZoom = blueBgState.zoom;
}

function blueBgGestureChange(event) {
  if (!blueBgState.canvasWidth) return;
  event.preventDefault();
  setBlueBgZoomAtPoint(blueBgState.gestureStartZoom * event.scale, event.clientX, event.clientY);
}

function loadImageSource(source) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    const crossOrigin = isCrossOriginImageSource(source);
    // 远程图片必须在设置 src 前声明 CORS 模式，否则一旦绘入 Canvas，
    // 浏览器会永久阻止 toBlob／toDataURL 导出。
    if (crossOrigin) image.crossOrigin = "anonymous";
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error(
      crossOrigin
        ? "远程图片未提供导出所需的跨域授权，请下载后重新导入该图片。"
        : "无法读取图片，请换一张重试。"
    ));
    image.src = source;
  });
}

function isCrossOriginImageSource(source) {
  try {
    const url = new URL(source, window.location.href);
    return /^https?:$/.test(url.protocol) && url.origin !== window.location.origin;
  } catch (error) {
    return false;
  }
}

function bgAspectRatioForMode(mode = blueBgState.aspectMode, state = blueBgState) {
  if (mode === "blue") return 2000 / 1083;
  if (mode === "default") return state.defaultAspect || 2000 / 1083;
  const preset = [...Object.values(BG_ASPECTS), ...customBgAspects].find(item => item.value === mode);
  return preset?.ratio || 2000 / 1083;
}

function setUnifiedBgCanvasSize(width, height, state = blueBgState) {
  state.canvasWidth = Math.max(320, Math.round(width));
  state.canvasHeight = Math.max(240, Math.round(height));
  if (state !== blueBgState) return;
  const canvas = blueBgCanvas();
  canvas.width = state.canvasWidth;
  canvas.height = state.canvasHeight;
  const stage = $("#blueBgStage");
  // 画布区保持与标注/编辑模块相同的固定工作区外观；真正的画布比例
  // 由 canvas 自身尺寸决定，不能把比例写到外层工作区上。
  if (stage) stage.style.removeProperty("aspect-ratio");
}

function updateUnifiedBgCanvasSize(firstImage = null, state = blueBgState) {
  if (state.aspectMode === "default" && firstImage) {
    const sourceWidth = firstImage.naturalWidth || 1;
    const sourceHeight = firstImage.naturalHeight || 1;
    const normalizedScale = IMAGE_EXPORT_WIDTH / Math.max(sourceWidth, sourceHeight);
    const normalizedWidth = sourceWidth * normalizedScale;
    const normalizedHeight = sourceHeight * normalizedScale;
    const shortSide = Math.min(normalizedWidth, normalizedHeight);
    const shadowOutset = Math.max(8, Math.min(50, Math.round(shortSide / 33))) * 2;
    const sourceWithShadow = {
      width: normalizedWidth + shadowOutset,
      height: normalizedHeight + shadowOutset,
    };
    const scaleRatio = 0.9;
    const aspect = sourceWithShadow.width / sourceWithShadow.height;
    const compensation = Math.min(Math.abs(aspect - 1), 1) * 0.15;
    let width = sourceWithShadow.width / scaleRatio;
    let height = sourceWithShadow.height / scaleRatio;
    if (aspect < 1) height *= 1 - compensation;
    if (aspect > 1) width *= 1 - compensation;
    const marginX = Math.max(40, Math.round(sourceWithShadow.width * 0.035));
    const marginY = Math.max(32, Math.round(sourceWithShadow.height * 0.035));
    width = Math.max(width, sourceWithShadow.width + marginX * 2);
    height = Math.max(height, sourceWithShadow.height + marginY * 2);
    state.defaultAspect = width / height;
  }
  const ratio = bgAspectRatioForMode(state.aspectMode, state);
  setUnifiedBgCanvasSize(2000, 2000 / ratio, state);
}

async function ensureUnifiedBgBackground(
  firstImage = null,
  state = blueBgState,
  { preserveCanvasSize = false } = {}
) {
  if (!preserveCanvasSize) updateUnifiedBgCanvasSize(firstImage, state);
  if (state.backgroundType === "wallpaper" && !state.backgroundImage) {
    const wallpaper = [...SYSTEM_WALLPAPERS, ...customBgWallpapers].find(item => item.id === state.backgroundImageName) || SYSTEM_WALLPAPERS[0];
    state.backgroundImage = await loadImageSource(wallpaper.url);
    state.backgroundImageName = wallpaper.id;
    state.backgroundImageUrl = wallpaper.url;
  }
  if (state.backgroundType === "image" && !state.backgroundImage && state.backgroundImageUrl) {
    state.backgroundImage = await loadImageSource(state.backgroundImageUrl);
  }
  if (state.backgroundType === "lizhi") {
    if (!state.headerImage) state.headerImage = await loadImageSource("./assets/IMG_header.png");
    if (!state.footerImage) state.footerImage = await loadImageSource("./assets/IMG_footer.png");
  }
  state.background = state.backgroundImage;
  if (state !== blueBgState) return;
  blueBgCanvas().width = state.canvasWidth;
  blueBgCanvas().height = state.canvasHeight;
}

async function loadBlueBgFile(file) {
  const url = URL.createObjectURL(file);
  try {
    const image = await loadImageSource(url);
    return { image, fileName: file.name };
  } finally {
    URL.revokeObjectURL(url);
  }
}

// corners 传 { tl, tr, br, bl } 时可按角关圆角：值为 false 的角走直角，
// 不传则四角都圆（原行为）。
function continuousRoundedRect(ctx, x, y, width, height, radius, corners = null) {
  const limit = Math.min(width / 2, height / 2);
  const full = Math.max(0, Math.min(radius * CONTINUOUS_CORNER_EXTENT, limit));
  const radiusFor = key => (corners && corners[key] === false ? 0 : full);
  const topLeft = radiusFor("tl");
  const topRight = radiusFor("tr");
  const bottomRight = radiusFor("br");
  const bottomLeft = radiusFor("bl");
  const power = 2 / CONTINUOUS_CORNER_EXPONENT;
  const steps = 24;
  const addCorner = (centerX, centerY, xSign, ySign, start, end, r) => {
    for (let index = 0; index <= steps; index++) {
      const angle = start + (end - start) * index / steps;
      const offsetX = r * Math.pow(Math.abs(Math.cos(angle)), power);
      const offsetY = r * Math.pow(Math.abs(Math.sin(angle)), power);
      ctx.lineTo(centerX + xSign * offsetX, centerY + ySign * offsetY);
    }
  };
  ctx.beginPath();
  ctx.moveTo(x + topLeft, y);
  ctx.lineTo(x + width - topRight, y);
  addCorner(x + width - topRight, y + topRight, 1, -1, Math.PI / 2, 0, topRight);
  ctx.lineTo(x + width, y + height - bottomRight);
  addCorner(x + width - bottomRight, y + height - bottomRight, 1, 1, 0, Math.PI / 2, bottomRight);
  ctx.lineTo(x + bottomLeft, y + height);
  addCorner(x + bottomLeft, y + height - bottomLeft, -1, 1, Math.PI / 2, 0, bottomLeft);
  ctx.lineTo(x, y + topLeft);
  addCorner(x + topLeft, y + topLeft, -1, -1, 0, Math.PI / 2, topLeft);
  ctx.closePath();
}

// 四角圆角开关按「左上 右上 右下 左下」顺序存成 4 位字符串（1 圆角 / 0 直角），
// 缺省视为四角全圆，老数据不用迁移。
const BG_CORNER_KEYS = ["tl", "tr", "br", "bl"];
const BG_CORNER_LABELS = { tl: "左上", tr: "右上", br: "右下", bl: "左下" };

function bgCornerFlags(value) {
  const text = typeof value === "string" && value.length === BG_CORNER_KEYS.length ? value : "1111";
  return {
    tl: text[0] !== "0",
    tr: text[1] !== "0",
    br: text[2] !== "0",
    bl: text[3] !== "0",
  };
}

function bgCornersFromFlags(flags) {
  return BG_CORNER_KEYS.map(key => (flags[key] ? "1" : "0")).join("");
}

function bgCornerLabel(value) {
  const flags = bgCornerFlags(value);
  const squared = BG_CORNER_KEYS.filter(key => !flags[key]);
  if (!squared.length) return "四角均为圆角";
  return `${squared.map(key => BG_CORNER_LABELS[key]).join("、")}为直角`;
}

function detectImageCornerRadius(image) {
  if (!image?.naturalWidth || !image?.naturalHeight) return 0;
  const sampleScale = Math.min(1, 512 / Math.max(image.naturalWidth, image.naturalHeight));
  const width = Math.max(8, Math.round(image.naturalWidth * sampleScale));
  const height = Math.max(8, Math.round(image.naturalHeight * sampleScale));
  const sample = document.createElement("canvas");
  sample.width = width;
  sample.height = height;
  const ctx = sample.getContext("2d", { willReadFrequently: true });
  ctx.drawImage(image, 0, 0, width, height);
  const pixels = ctx.getImageData(0, 0, width, height).data;
  const alphaAt = (x, y) => pixels[(y * width + x) * 4 + 3];
  const scans = [];
  [
    [0, 1, 0, 1],
    [width - 1, -1, 0, 1],
    [0, 1, height - 1, -1],
    [width - 1, -1, height - 1, -1],
  ].forEach(([xStart, xStep, yStart, yStep]) => {
    const limit = Math.floor(Math.min(width, height) / 2);
    let horizontal = null;
    let vertical = null;
    for (let index = 0; index < limit; index += 1) {
      if (horizontal === null && alphaAt(xStart + xStep * index, yStart) >= 16) horizontal = index;
      if (vertical === null && alphaAt(xStart, yStart + yStep * index) >= 16) vertical = index;
      if (horizontal !== null && vertical !== null) break;
    }
    if (horizontal !== null && vertical !== null) scans.push(Math.max(horizontal, vertical));
  });
  if (scans.length < 3) return 0;
  scans.sort((a, b) => a - b);
  const edgeExtent = scans[Math.floor(scans.length / 2)];
  if (edgeExtent < 4) return 0;
  return Math.max(1, Math.round(edgeExtent / CONTINUOUS_CORNER_EXTENT / sampleScale));
}

function drawBlueBgLayer(ctx, layer) {
  const storedRadius = Number(layer.cornerRadius);
  const requestedRadius = Number.isFinite(storedRadius) ? storedRadius : SYSTEM_CORNER_RADIUS;
  const preserveTransparentCorners = layer.round && layer.cornerAuto !== false && layer.hasTransparentCorners;
  const shouldClipRound = layer.round && !preserveTransparentCorners;
  const radius = shouldClipRound
    ? Math.min(Math.max(0, requestedRadius), layer.width / 2, layer.height / 2)
    : 0;
  const corners = bgCornerFlags(layer.corners);
  if (layer.shadow) {
    const sigma = blueBgShadowSigma(layer);
    const renderScale = canvasContextScale(ctx);
    const surface = blueBgLayerSurface(layer, shouldClipRound, radius, sigma * 2, renderScale);
    ctx.save();
    ctx.shadowColor = "rgba(0, 0, 0, .25)";
    ctx.shadowBlur = sigma * renderScale;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;
    ctx.drawImage(
      surface.canvas,
      layer.x - surface.padding,
      layer.y - surface.padding,
      surface.width,
      surface.height
    );
    ctx.restore();
  }
  if (shouldClipRound) {
    ctx.save();
    continuousRoundedRect(ctx, layer.x, layer.y, layer.width, layer.height, radius, corners);
    ctx.clip();
    ctx.drawImage(layer.image, layer.x, layer.y, layer.width, layer.height);
    ctx.restore();
  } else {
    ctx.drawImage(layer.image, layer.x, layer.y, layer.width, layer.height);
  }
}

function blueBgShadowSigma(layer) {
  return Math.max(2, Math.min(50, Math.round(Math.min(layer.width, layer.height) / 33)));
}

function canvasContextScale(ctx) {
  const transform = ctx.getTransform?.();
  return transform ? Math.max(0.01, Math.hypot(transform.a, transform.b)) : 1;
}

function blueBgLayerSurface(layer, shouldClipRound, radius, padding, renderScale = 1) {
  const width = Math.max(1, Math.ceil(layer.width * renderScale));
  const height = Math.max(1, Math.ceil(layer.height * renderScale));
  const inset = Math.ceil(padding * renderScale);
  // 四角开关要进缓存键，否则改角以后会拿到旧形状的阴影底图。
  const cornerKey = shouldClipRound ? bgCornersFromFlags(bgCornerFlags(layer.corners)) : "off";
  const cacheKey = `${width}:${height}:${shouldClipRound ? Math.round(radius * renderScale * 100) : 0}:${inset}:${cornerKey}`;
  const cached = blueBgLayerSurfaceCache.get(layer);
  if (cached?.key === cacheKey && cached.image === layer.image) return cached.surface;
  const canvas = document.createElement("canvas");
  canvas.width = width + inset * 2;
  canvas.height = height + inset * 2;
  const surfaceCtx = canvas.getContext("2d");
  if (shouldClipRound) {
    continuousRoundedRect(surfaceCtx, inset, inset, width, height, radius * renderScale, bgCornerFlags(layer.corners));
    surfaceCtx.clip();
  }
  surfaceCtx.drawImage(layer.image, inset, inset, width, height);
  const surface = {
    canvas,
    padding: inset / renderScale,
    width: canvas.width / renderScale,
    height: canvas.height / renderScale,
  };
  blueBgLayerSurfaceCache.set(layer, { key: cacheKey, image: layer.image, surface });
  return surface;
}

function blueBgLayerVisualGeometry(layer) {
  const shadowOutset = layer.shadow ? blueBgShadowSigma(layer) * 2 : 0;
  const left = shadowOutset;
  const right = shadowOutset;
  const top = shadowOutset;
  const bottom = shadowOutset;
  return {
    bounds: {
      x: layer.x - left,
      y: layer.y - top,
      width: layer.width + left + right,
      height: layer.height + top + bottom,
    },
    outsets: { left, right, top, bottom },
  };
}

function blueBgHandles(layer) {
  return [
    { key: "nw", x: layer.x, y: layer.y },
    { key: "ne", x: layer.x + layer.width, y: layer.y },
    { key: "sw", x: layer.x, y: layer.y + layer.height },
    { key: "se", x: layer.x + layer.width, y: layer.y + layer.height },
  ];
}

function renderBlueBgCanvas(forExport = false, targetCanvas = blueBgCanvas()) {
  if (!blueBgState.canvasWidth || !blueBgState.canvasHeight) {
    if (!forExport) {
      syncCanvasSelectionOverlays(
        $("#blueBgStage"), targetCanvas, $("#blueBgSelectionOverlay"), []
      );
    }
    return;
  }
  targetCanvas.width = blueBgState.canvasWidth;
  targetCanvas.height = blueBgState.canvasHeight;
  const ctx = targetCanvas.getContext("2d");
  ctx.clearRect(0, 0, targetCanvas.width, targetCanvas.height);
  if (!blueBgState.layers.length && !forExport) {
    blueBgState.snapGuides = { vertical: [], horizontal: [] };
    $("#bgAnnotationCanvas").hidden = true;
    syncCanvasSelectionOverlays(
      $("#blueBgStage"), targetCanvas, $("#blueBgSelectionOverlay"), []
    );
    return;
  }
  drawUnifiedBackground(ctx, targetCanvas);
  blueBgState.layers.forEach(layer => drawBlueBgLayer(ctx, layer));
  syncBgAnnotationSource(targetCanvas);
  if (forExport) {
    withAnnotationState(bgAnnotationState, () => {
      bgAnnotationState.items.forEach(item => drawAnnotationItem(ctx, item, false));
    });
    return;
  }
  drawCanvasSnapGuides(ctx, targetCanvas, blueBgState.snapGuides);
  const annotating = blueBgState.toolMode === "annotation";
  const annotationSelected = bgAnnotationState.selectedId !== null || bgAnnotationState.selectedIds.length > 0;
  $("#blueBgStage").classList.toggle("is-annotating", annotating);
  $("#bgAnnotationCanvas").hidden = !blueBgState.layers.length;
  withAnnotationState(bgAnnotationState, () => renderAnnotationCanvas(annotating || annotationSelected));
  syncCanvasSelectionOverlays(
    $("#blueBgStage"),
    targetCanvas,
    $("#blueBgSelectionOverlay"),
    annotating ? [] : blueBgSelectionEntries()
  );
}

function withAnnotationState(state, action) {
  const previous = annotationState;
  annotationState = state;
  try {
    return action();
  } finally {
    annotationState = previous;
  }
}

// 标注层必须跟背景画布共用完全相同的显示尺寸与尺寸约束，缺一不可：
// resetBlueBgZoom 会把两层的内联样式一起清空，之后若只补宽高，标注层就
// 重新落回 CSS 的 max-height: calc(100vh - 290px)。此时高度被压缩、宽度
// 不受限（grid 列的百分比 max-width 没有参照而失效），画布上的圆点序号
// 会被拉成横椭圆。切换画布标签后直接缩放正是这条路径。
function syncBgAnnotationBox(canvas = blueBgCanvas()) {
  const overlay = $("#bgAnnotationCanvas");
  if (!overlay || !canvas) return null;
  overlay.style.width = canvas.style.width;
  overlay.style.height = canvas.style.height;
  overlay.style.maxWidth = canvas.style.maxWidth;
  overlay.style.maxHeight = canvas.style.maxHeight;
  return overlay;
}

function syncBgAnnotationSource(sourceCanvas = blueBgCanvas()) {
  if (!sourceCanvas?.width || !sourceCanvas?.height) return;
  let snapshot = bgAnnotationState.image;
  if (!(snapshot instanceof HTMLCanvasElement)) snapshot = document.createElement("canvas");
  snapshot.width = sourceCanvas.width;
  snapshot.height = sourceCanvas.height;
  snapshot.getContext("2d").drawImage(sourceCanvas, 0, 0);
  bgAnnotationState.image = snapshot;
  // 导出等场景传入的是临时合成画布，只更新快照，绝不触碰屏幕上的
  // 标注层；重设画布尺寸会清空已绘制内容，导致导出后标注“消失”。
  if (sourceCanvas !== blueBgCanvas()) return;
  const overlay = $("#bgAnnotationCanvas");
  // 仅在尺寸真的变化时才重设尺寸，避免无谓清空标注层。
  if (overlay.width !== sourceCanvas.width) overlay.width = sourceCanvas.width;
  if (overlay.height !== sourceCanvas.height) overlay.height = sourceCanvas.height;
  syncBgAnnotationBox(sourceCanvas);
}

function clearBgAnnotationSelection() {
  bgAnnotationState.selectedId = null;
  bgAnnotationState.selectedIds = [];
  bgAnnotationState.selectedPart = null;
  bgAnnotationState.interaction = null;
  bgAnnotationState.snapGuides = emptySnapGuides();
  syncCanvasSelectionOverlays(
    $("#blueBgStage"), $("#bgAnnotationCanvas"), $("#bgAnnotationSelectionOverlay"), []
  );
}

function clearBlueBgSelection() {
  blueBgState.selectedId = null;
  blueBgState.selectedIds = [];
  blueBgState.interaction = null;
  blueBgState.snapGuides = emptySnapGuides();
  syncCanvasSelectionOverlays(
    $("#blueBgStage"), blueBgCanvas(), $("#blueBgSelectionOverlay"), []
  );
}

function clearAllBgCanvasSelections() {
  clearBlueBgSelection();
  clearBgAnnotationSelection();
}

function activateBgAnnotationMode(mode) {
  if (!blueBgState.layers.length) return;
  annotationState = bgAnnotationState;
  syncBgAnnotationSource();
  blueBgState.selectedId = null;
  blueBgState.selectedIds = [];
  blueBgState.interaction = null;
  blueBgState.snapGuides = emptySnapGuides();
  blueBgState.toolMode = "annotation";
  setBgInspectorMode("annotation");
  setAnnotationMode(mode);
  renderBlueBgCanvas();
}

// 美化画布的画笔光标独立于系统鼠标：圆环直径始终对应实际笔触粗细。
let bgAnnotationPenCursor = null;

function ensureBgAnnotationPenCursor() {
  if (bgAnnotationPenCursor) return bgAnnotationPenCursor;
  const cursor = document.createElement("div");
  cursor.className = "brush-cursor bg-annotation-pen-cursor";
  cursor.hidden = true;
  $("#blueBgStage").appendChild(cursor);
  bgAnnotationPenCursor = cursor;
  return cursor;
}

function updateBgAnnotationPenCursor(event) {
  const cursor = ensureBgAnnotationPenCursor();
  const canvas = $("#bgAnnotationCanvas");
  const rect = canvas.getBoundingClientRect();
  const active = blueBgState.toolMode === "annotation" &&
    bgAnnotationState.mode === "pen";
  const inside = event.clientX >= rect.left && event.clientX <= rect.right &&
    event.clientY >= rect.top && event.clientY <= rect.bottom;
  cursor.hidden = !active || !inside;
  if (cursor.hidden) return;
  const stage = $("#blueBgStage");
  const stageRect = stage.getBoundingClientRect();
  const diameter = Math.max(2, (bgAnnotationState.penWidth || 6) * rect.width / Math.max(1, canvas.width));
  cursor.style.width = `${diameter}px`;
  cursor.style.height = `${diameter}px`;
  cursor.style.left = `${event.clientX - stageRect.left + stage.scrollLeft}px`;
  cursor.style.top = `${event.clientY - stageRect.top + stage.scrollTop}px`;
}

function hideBgAnnotationPenCursor() {
  if (bgAnnotationPenCursor) bgAnnotationPenCursor.hidden = true;
}

function selectedBlueBgLayer() {
  return blueBgState.layers.find(layer => layer.id === blueBgState.selectedId) || null;
}

function selectedBlueBgLayers() {
  const ids = blueBgState.selectedIds.length
    ? new Set(blueBgState.selectedIds)
    : new Set(blueBgState.selectedId === null ? [] : [blueBgState.selectedId]);
  return blueBgState.layers.filter(layer => ids.has(layer.id));
}

async function selectUnifiedBgMaterial(index, additive = false) {
  const material = bgMaterials[index];
  if (!material) return;
  let layer = blueBgState.layers.find(item => item.materialIndex === index);
  if (!layer && blueBgState.layers.length < BLUE_BG_MAX_LAYERS) {
    await addBlueBgFiles([material.file]);
    layer = blueBgState.layers.find(item => item.materialIndex === index);
    syncBlueBgLayersToMaterialOrder();
  }
  if (!layer) return;
  annotationState = bgAnnotationState;
  if (!additive) clearBgAnnotationSelection();
  blueBgState.toolMode = "move";
  setBgInspectorMode("effects");
  const ids = new Set(additive ? selectedBlueBgLayers().map(item => item.id) : []);
  const adding = !additive || !ids.has(layer.id);
  if (adding) ids.add(layer.id);
  else ids.delete(layer.id);
  blueBgState.selectedIds = [...ids];
  blueBgState.selectedId = adding ? layer.id : (blueBgState.selectedIds.at(-1) ?? null);
  if (!blueBgState.selectedIds.length &&
      (bgAnnotationState.selectedId !== null || bgAnnotationState.selectedIds.length)) {
    setBgInspectorMode("annotation");
  } else if (!blueBgState.selectedIds.length) {
    blueBgState.toolMode = "background";
    setBgInspectorMode("background");
  }
  material.unused = false;
  updateBlueBgControls();
  renderBlueBgCanvas();
}

function selectNextBlueBgLayer() {
  if (!blueBgState.layers.length) return false;
  const topToBottom = [...blueBgState.layers].reverse();
  const currentIndex = topToBottom.findIndex(layer => layer.id === blueBgState.selectedId);
  const next = topToBottom[(currentIndex + 1 + topToBottom.length) % topToBottom.length];
  clearBgAnnotationSelection();
  blueBgState.selectedId = next.id;
  blueBgState.selectedIds = [];
  blueBgState.interaction = null;
  blueBgState.toolMode = "move";
  setBgInspectorMode("effects");
  updateBlueBgControls();
  renderBlueBgCanvas();
  $("#blueBgStage").focus();
  blueBgStatus(`已选择前景图：${next.fileName || "图片"}`);
  return true;
}

function blueBgSelectionBounds() {
  return unionBounds(selectedBlueBgLayers().map(layer => blueBgLayerVisualGeometry(layer).bounds));
}

function blueBgSelectionEntries() {
  return selectedBlueBgLayers()
    .map(layer => ({ id: layer.id, bounds: blueBgLayerVisualGeometry(layer).bounds }))
    .sort((a, b) => Number(b.id === blueBgState.selectedId) - Number(a.id === blueBgState.selectedId));
}

function drawCoverImage(ctx, image, width, height) {
  if (!image?.naturalWidth || !image?.naturalHeight) return;
  const scale = Math.max(width / image.naturalWidth, height / image.naturalHeight);
  const drawWidth = image.naturalWidth * scale;
  const drawHeight = image.naturalHeight * scale;
  ctx.drawImage(image, (width - drawWidth) / 2, (height - drawHeight) / 2, drawWidth, drawHeight);
}

function drawUnifiedBackground(ctx, canvas) {
  const width = canvas.width;
  const height = canvas.height;
  const type = blueBgState.backgroundType;
  if (type === "transparent") return;
  if (type === "image" || type === "wallpaper") {
    ctx.fillStyle = "#eaf0f6";
    ctx.fillRect(0, 0, width, height);
    drawCoverImage(ctx, blueBgState.backgroundImage, width, height);
    return;
  }
  if (type === "gradient") {
    const preset = [...BG_GRADIENT_PRESETS, ...customBgGradients].find(item => item.id === blueBgState.backgroundGradient) || BG_GRADIENT_PRESETS[0];
    const angle = (preset.angle || 135) * Math.PI / 180;
    const length = Math.abs(width * Math.cos(angle)) + Math.abs(height * Math.sin(angle));
    const centerX = width / 2;
    const centerY = height / 2;
    const x = Math.cos(angle) * length / 2;
    const y = Math.sin(angle) * length / 2;
    const gradient = ctx.createLinearGradient(centerX - x, centerY - y, centerX + x, centerY + y);
    gradient.addColorStop(0, preset.from);
    gradient.addColorStop(1, preset.to);
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);
    return;
  }
  if (type === "lizhi") {
    // 荔枝默认背景沿用原始自动加底的浅蓝底色。这里不能复用
    // “纯色”的默认蓝色，否则页眉、页脚之间会露出一条深蓝色带。
    ctx.fillStyle = LIZHI_DEFAULT_COLOR;
    ctx.fillRect(0, 0, width, height);
    if (blueBgState.footerImage) {
      const footerHeight = blueBgState.footerImage.naturalHeight * width / blueBgState.footerImage.naturalWidth;
      ctx.drawImage(blueBgState.footerImage, 0, height - footerHeight, width, footerHeight);
    }
    if (blueBgState.headerImage) {
      const headerHeight = blueBgState.headerImage.naturalHeight * width / blueBgState.headerImage.naturalWidth;
      ctx.drawImage(blueBgState.headerImage, 0, 0, width, headerHeight);
    }
    return;
  }
  if (type === "blue") {
    ctx.fillStyle = BG_DEFAULT_COLOR;
    ctx.fillRect(0, 0, width, height);
    return;
  }
  ctx.fillStyle = blueBgState.backgroundColor || BG_DEFAULT_COLOR;
  ctx.fillRect(0, 0, width, height);
}

function renderBgWallpaperChoices() {
  const wrap = $("#bgWallpaperChoices");
  if (!wrap) return;
  wrap.innerHTML = "";
  [...SYSTEM_WALLPAPERS, ...customBgWallpapers].forEach(wallpaper => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "bg-background-tile";
    button.dataset.bgType = "wallpaper";
    button.dataset.bgWallpaper = wallpaper.id;
    const label = wallpaper.label.replace("macOS ", "");
    const compactClass = label.length >= 10 ? " bg-background-tile-label-compact" : "";
    button.innerHTML = `<span class="bg-background-tile-preview"><img src="${wallpaper.url}" alt=""></span><strong class="${compactClass.trim()}">${label}</strong>`;
    // 只有自定义壁纸才带 data-bg-custom 标记：点击处理器用属性存在与否
    // 判断「要不要打开文件选择框」，写成空字符串会让系统壁纸也命中，
    // 点壁纸磁贴就变成弹文件框、背景反而没切。
    if (wallpaper.custom) button.dataset.bgCustom = "true";
    button.title = `${wallpaper.label} · 来源：${wallpaper.source}`;
    wrap.appendChild(button);
  });
  const customButton = document.createElement("button");
  customButton.type = "button";
  customButton.className = "bg-background-tile bg-background-add-tile";
  customButton.dataset.bgAddCustom = "wallpaper";
  customButton.title = "上传自定义背景图片";
  customButton.innerHTML = '<span class="bg-background-tile-preview bg-background-add-preview"><span class="tool-symbol tool-symbol-import" aria-hidden="true"></span></span><strong>上传自定义</strong>';
  wrap.appendChild(customButton);
}

function renderBgCustomChoices() {
  const gradientGrid = $("[aria-labelledby=bgGradientTitle] .bg-background-tile-grid");
  if (gradientGrid) {
    gradientGrid.querySelectorAll("[data-bg-custom-gradient]").forEach(tile => tile.remove());
    customBgGradients.forEach(item => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "bg-background-tile";
      button.dataset.bgType = "gradient";
      button.dataset.bgGradient = item.id;
      button.dataset.bgCustomGradient = "true";
      button.title = `${item.label}（自定义）`;
      button.innerHTML = `<span class="bg-background-tile-preview" style="background:linear-gradient(135deg,${item.from},${item.to})"></span><strong>${item.label}</strong>`;
      gradientGrid.appendChild(button);
    });
    const add = gradientGrid.querySelector("[data-bg-add-custom=gradient]");
    if (add) gradientGrid.appendChild(add);
  }
  const aspectGrid = $(".bg-aspect-tile-grid");
  if (aspectGrid) {
    aspectGrid.querySelectorAll("[data-bg-custom-aspect]").forEach(tile => tile.remove());
    customBgAspects.forEach(item => {
      const button = document.createElement("button");
      button.type = "button";
      button.dataset.bgAspect = item.value;
      button.dataset.bgCustomAspect = "true";
      button.title = `${item.label}（自定义）`;
      button.textContent = item.label;
      aspectGrid.insertBefore(button, aspectGrid.querySelector("[data-bg-add-custom=aspect]") || null);
    });
  }
}

function addCustomBgGradient() {
  const from = prompt("请输入渐变起始颜色（例如 #42B5F5）", "#42B5F5")?.trim();
  if (!from) return;
  const to = prompt("请输入渐变结束颜色（例如 #E8F5FF）", "#E8F5FF")?.trim();
  if (!to || !CSS.supports("color", from) || !CSS.supports("color", to)) {
    blueBgStatus("请输入有效的颜色值。");
    return;
  }
  const id = `custom-gradient-${Date.now()}`;
  customBgGradients.push({ id, label: "自定义", from, to, angle: 135, custom: true });
  renderBgCustomChoices();
  $("#bgBackgroundType").value = "gradient";
  $("#bgBackgroundGradient").value = id;
  applyBgBackgroundFromTiles();
}

function addCustomBgAspect() {
  const raw = prompt("请输入画面比例，例如 5:4", "5:4")?.trim();
  const match = raw?.match(/^(\d+(?:\.\d+)?)\s*[:：]\s*(\d+(?:\.\d+)?)$/);
  if (!match || Number(match[1]) <= 0 || Number(match[2]) <= 0) {
    if (raw) blueBgStatus("请输入有效的画面比例，例如 5:4。");
    return;
  }
  const width = Number(match[1]);
  const height = Number(match[2]);
  const value = `custom-${Date.now()}`;
  customBgAspects.push({ value, label: `${match[1]} : ${match[2]}`, ratio: width / height, custom: true });
  renderBgCustomChoices();
  $("#bgCanvasAspect").value = value;
  applyBgBackgroundFromTiles();
}

async function addCustomBgWallpaper(file) {
  if (!file) return;
  const url = URL.createObjectURL(file);
  const id = `custom-wallpaper-${Date.now()}`;
  customBgWallpapers.push({ id, label: file.name, url, source: "自定义", custom: true });
  renderBgWallpaperChoices();
  $("#bgBackgroundType").value = "wallpaper";
  $("#bgWallpaperSelect").value = id;
  await applyBgBackgroundFromTiles();
}

function syncBgBackgroundTileSelection() {
  const type = $("#bgBackgroundType").value || blueBgState.backgroundType;
  const gradient = $("#bgBackgroundGradient").value || blueBgState.backgroundGradient;
  const wallpaper = $("#bgWallpaperSelect").value || blueBgState.backgroundImageName;
  $$("[data-bg-type]", $("#bgBackgroundDialog")).forEach(tile => {
    const active = tile.dataset.bgType === type &&
      (type !== "gradient" || tile.dataset.bgGradient === gradient) &&
      (type !== "wallpaper" || tile.dataset.bgWallpaper === wallpaper);
    tile.classList.toggle("active", active);
  });
  $$("[data-bg-aspect]", $("#bgBackgroundDialog")).forEach(tile => {
    tile.classList.toggle("active", tile.dataset.bgAspect === $("#bgCanvasAspect").value);
  });
  $("#bgSolidTilePreview").style.background = $("#bgBackgroundColor").value || BG_DEFAULT_COLOR;
}

function setBgInspectorMode(mode) {
  blueBgState.inspectorMode = ["background", "annotation"].includes(mode) ? mode : "effects";
  const backgroundActive = blueBgState.inspectorMode === "background";
  const annotationActive = blueBgState.inspectorMode === "annotation";
  const effectsActive = blueBgState.inspectorMode === "effects" && selectedBlueBgLayers().length > 0;
  $("#bgBackgroundDialog").hidden = !backgroundActive;
  $("#bgEffectToolbar").hidden = backgroundActive || annotationActive;
  $("#bgAnnotationInspector").hidden = !annotationActive;
  $("#bgViewMode").classList.toggle("active", backgroundActive);
  $("#bgBackgroundButton").classList.toggle("active", effectsActive);
}

function openBgBackgroundDialog() {
  const panel = $("#bgBackgroundDialog");
  if (!panel) return;
  $("#bgBackgroundType").value = blueBgState.backgroundType;
  $("#bgBackgroundColor").value = localStorage.getItem(BG_CUSTOM_COLOR_KEY) || blueBgState.backgroundColor || BG_DEFAULT_COLOR;
  $("#bgBackgroundGradient").value = blueBgState.backgroundGradient || BG_GRADIENT_PRESETS[0].id;
  $("#bgCanvasAspect").value = blueBgState.aspectMode || "default";
  renderBgWallpaperChoices();
  renderBgCustomChoices();
  const wallpaper = [...SYSTEM_WALLPAPERS, ...customBgWallpapers].find(item => item.id === blueBgState.backgroundImageName) || SYSTEM_WALLPAPERS[0];
  $("#bgWallpaperSelect").value = wallpaper.id;
  const feedback = $("#bgBackgroundFeedback");
  feedback.textContent = "";
  feedback.hidden = true;
  syncBgBackgroundTileSelection();
  blueBgState.selectedId = null;
  blueBgState.selectedIds = [];
  blueBgState.interaction = null;
  blueBgState.snapGuides = emptySnapGuides();
  blueBgState.toolMode = "background";
  clearBgAnnotationSelection();
  setBgInspectorMode("background");
  renderBlueBgCanvas();
  updateBlueBgControls();
}

function closeBgBackgroundPanel() {
  if (!selectedBlueBgLayers().length) {
    openBgBackgroundDialog();
    return;
  }
  blueBgState.toolMode = "move";
  clearBgAnnotationSelection();
  setBgInspectorMode("effects");
  $("#blueBgStage").classList.remove("is-annotating");
}

function openBgImageStylePanel() {
  if (!selectedBlueBgLayers().length) {
    openBgBackgroundDialog();
    return;
  }
  blueBgState.toolMode = "move";
  clearBgAnnotationSelection();
  setBgInspectorMode("effects");
  $("#blueBgStage").classList.remove("is-annotating");
  updateBlueBgControls();
  renderBlueBgCanvas();
  blueBgStatus("图片样式：可调节所选前景图的阴影、圆角和缩放比例。");
}

async function applyBgBackgroundFromTiles() {
  const panel = $("#bgBackgroundDialog");
  const feedback = $("#bgBackgroundFeedback");
  feedback.textContent = "";
  feedback.hidden = true;
  panel.classList.add("is-applying");
  syncBgBackgroundTileSelection();
  try {
    await applyBgBackgroundSettings();
    syncBgBackgroundTileSelection();
  } catch (error) {
    feedback.textContent = error.message;
    feedback.hidden = false;
    blueBgStatus(error.message);
  } finally {
    panel.classList.remove("is-applying");
  }
}

async function applyBgBackgroundSettings() {
  const type = $("#bgBackgroundType").value;
  const aspectMode = $("#bgCanvasAspect").value;
  const materialValue = $("#bgBackgroundMaterial").value;
  const selectedMaterialIndex = materialValue === "" ? -1 : Number(materialValue);
  const previousCanvasWidth = blueBgState.canvasWidth;
  const previousCanvasHeight = blueBgState.canvasHeight;
  blueBgState.backgroundType = type;
  blueBgState.aspectMode = aspectMode;
  blueBgState.backgroundColor = $("#bgBackgroundColor").value || BG_DEFAULT_COLOR;
  if (type === "solid") localStorage.setItem(BG_CUSTOM_COLOR_KEY, blueBgState.backgroundColor);
  blueBgState.backgroundGradient = $("#bgBackgroundGradient").value || BG_GRADIENT_PRESETS[0].id;
  if (type === "wallpaper") {
    const wallpaper = [...SYSTEM_WALLPAPERS, ...customBgWallpapers].find(item => item.id === $("#bgWallpaperSelect").value) || SYSTEM_WALLPAPERS[0];
    blueBgState.backgroundImage = await loadImageSource(wallpaper.url);
    blueBgState.backgroundImageName = wallpaper.id;
    blueBgState.backgroundImageUrl = wallpaper.url;
  } else if (type === "image") {
    const file = $("#bgBackgroundFile").files?.[0];
    if (file) {
      blueBgState.backgroundImageUrl = URL.createObjectURL(file);
      blueBgState.backgroundImageName = file.name;
      blueBgState.backgroundImage = await loadImageSource(blueBgState.backgroundImageUrl);
    } else if (Number.isInteger(selectedMaterialIndex) && selectedMaterialIndex >= 0 && bgMaterials[selectedMaterialIndex]) {
      const material = bgMaterials[selectedMaterialIndex];
      blueBgState.backgroundImageUrl = material.previewUrl;
      blueBgState.backgroundImageName = material.file.name;
      blueBgState.backgroundImage = await loadImageSource(material.previewUrl);
    } else if (!blueBgState.backgroundImage) {
      throw new Error("请选择一个自定义图片或素材库图片。");
    }
  } else {
    blueBgState.backgroundImage = null;
    blueBgState.backgroundImageUrl = "";
    blueBgState.backgroundImageName = "";
  }
  await ensureUnifiedBgBackground(blueBgState.layers[0]?.image || null);
  if (previousCanvasWidth && previousCanvasHeight &&
      (previousCanvasWidth !== blueBgState.canvasWidth || previousCanvasHeight !== blueBgState.canvasHeight)) {
    blueBgState.layers.forEach(layer => {
      const centerRatioX = (layer.x + layer.width / 2) / previousCanvasWidth;
      const centerRatioY = (layer.y + layer.height / 2) / previousCanvasHeight;
      // 导出宽度固定为 2000px。切换画布比例时只按相对中心重新定位，
      // 不允许横纵分别缩放前景图，否则图片和圆角都会被拉伸。
      const uniformScale = blueBgState.canvasWidth / previousCanvasWidth;
      layer.width *= uniformScale;
      layer.height *= uniformScale;
      layer.fitWidth *= uniformScale;
      layer.fitHeight *= uniformScale;
      layer.x = centerRatioX * blueBgState.canvasWidth - layer.width / 2;
      layer.y = centerRatioY * blueBgState.canvasHeight - layer.height / 2;
      clampBlueBgLayer(layer);
    });
  }
  $("#blueBgStage")?.classList.toggle("is-transparent-background", type === "transparent");
  if (type === "transparent") expandTransparentBlueBgCanvas();
  renderBlueBgCanvas();
  resetBlueBgZoom();
  pushBgHistory();
  updateBgControlsAfterBackgroundChange();
  if (type === "image") $("#bgBackgroundFile").value = "";
  blueBgStatus(`背景已切换为「${backgroundTypeLabel(type)}」 · 画布 ${blueBgState.canvasWidth} × ${blueBgState.canvasHeight}`);
}

function backgroundTypeLabel(type) {
  return { lizhi: "荔枝默认", blue: "蓝色", solid: "自定义颜色", transparent: "无背景", gradient: "渐变色", image: "自定义图片", wallpaper: "系统壁纸" }[type] || type;
}

function updateBgControlsAfterBackgroundChange() {
  updateBlueBgControls();
  renderBgMaterialList();
  updateBgExportState();
}

function selectedDefaultBgMaterial() {
  return bgMaterials[bgSelectedMaterialIndex] || null;
}

function selectedDefaultBgMaterialIndexes() {
  if (bgSelectedMaterialIndices.length) {
    return bgSelectedMaterialIndices.filter(index => index >= 0 && index < bgMaterials.length);
  }
  return bgSelectedMaterialIndex >= 0 ? [bgSelectedMaterialIndex] : [];
}

function selectedDefaultBgMaterials() {
  return selectedDefaultBgMaterialIndexes().map(index => bgMaterials[index]).filter(Boolean);
}

function syncBgEffectToolbar() {
  const blueprint = $("#bgBlueMode").checked;
  const selectedItems = blueprint ? selectedBlueBgLayers() : selectedDefaultBgMaterials();
  const selected = selectedItems[0] || null;
  const disabled = !selected;
  const canvasZoomDisabled = $("#blueBgEditor").hidden || !blueBgState.layers.length;
  const toolbar = $("#bgEffectToolbar");
  toolbar.classList.toggle("is-disabled", disabled);
  $("#bgDeleteSelected").disabled = disabled;
  $("#bgEffectShadow").disabled = disabled;
  $("#bgEffectRound").disabled = disabled;
  $("#bgEffectRoundRadius").disabled = disabled || selectedItems.every(item => !item.round);
  $("#bgEffectScale").disabled = disabled;
  $("#bgCanvasZoom").disabled = canvasZoomDisabled;
  $("#bgCanvasZoom").value = String(Math.round(blueBgState.zoom * 100));
  $("#bgCanvasZoomValue").textContent = `${Math.round(blueBgState.zoom * 100)}%`;
  $("#bgEffectScale").min = blueprint ? "10" : "40";
  $("#bgEffectScale").max = "500";
  if (selected) {
    $("#bgEffectShadow").checked = selected.shadow;
    $("#bgEffectRound").checked = selected.round;
    $("#bgEffectShadow").indeterminate = selectedItems.some(item => item.shadow !== selected.shadow);
    $("#bgEffectRound").indeterminate = selectedItems.some(item => item.round !== selected.round);
    const storedRadius = Number(selected.cornerRadius);
    const radius = Math.max(0, Math.round(Number.isFinite(storedRadius) ? storedRadius : SYSTEM_CORNER_RADIUS));
    $("#bgEffectRoundRadius").value = String(Math.min(128, radius));
    $("#bgEffectRoundRadiusValue").textContent = `${radius} px`;
    const cornerFlags = bgCornerFlags(selected.corners);
    $$("#bgEffectCorners button").forEach(button => {
      button.disabled = disabled || !selected.round;
      button.classList.toggle("active", Boolean(cornerFlags[button.dataset.bgCorner]));
    });
    $("#bgEffectCornersValue").textContent = bgCornerLabel(bgCornersFromFlags(cornerFlags));
    const scale = blueprint
      ? Math.round(selected.width / selected.fitWidth * 100)
      : selected.scale;
    $("#bgEffectScale").value = String(scale);
    $("#bgEffectScaleValue").textContent = `${scale}%`;
  } else {
    $("#bgEffectShadow").checked = false;
    $("#bgEffectRound").checked = false;
    $("#bgEffectShadow").indeterminate = false;
    $("#bgEffectRound").indeterminate = false;
    $("#bgEffectRoundRadius").value = String(SYSTEM_CORNER_RADIUS);
    $("#bgEffectRoundRadiusValue").textContent = `${SYSTEM_CORNER_RADIUS} px`;
    $$("#bgEffectCorners button").forEach(button => {
      button.disabled = true;
      button.classList.remove("active");
    });
    $("#bgEffectCornersValue").textContent = bgCornerLabel("1111");
    $("#bgEffectScaleValue").textContent = "—";
  }
}

function updateBlueBgControls() {
  const selectedLayers = selectedBlueBgLayers();
  $("#blueBgStage").classList.toggle("has-layers", blueBgState.layers.length > 0);
  $("#bgViewMode").disabled = false;
  $("#bgViewMode").classList.toggle("active", blueBgState.inspectorMode === "background");
  $("#bgBackgroundButton").disabled = !selectedLayers.length;
  $("#bgBackgroundButton").classList.toggle(
    "active",
    selectedLayers.length > 0 && blueBgState.inspectorMode === "effects"
  );
  withAnnotationState(bgAnnotationState, updateBgAnnotationControls);
  syncBgEffectToolbar();
  renderBgMaterialList();
  updateBgExportState();
}

function clampBlueBgLayer(layer) {
  const canvas = blueBgCanvas();
  layer.width = Math.max(Math.max(80, layer.fitWidth * 0.1), Math.min(layer.fitWidth * 5, layer.width));
  layer.height = Math.max(Math.max(60, layer.fitHeight * 0.1), Math.min(layer.fitHeight * 5, layer.height));
  const radius = Number(layer.cornerRadius);
  // 状态中的圆角值是用户设置的画布像素值；绘制时才按当前图层尺寸
  // 临时限幅，不能在缩小图层后永久改小该设置。
  layer.cornerRadius = Math.max(0, Math.min(
    128,
    Number.isFinite(radius) ? radius : SYSTEM_CORNER_RADIUS
  ));
  if (blueBgState.backgroundType === "transparent") return;
  const minVisible = 24;
  layer.x = Math.max(-layer.width + minVisible, Math.min(canvas.width - minVisible, layer.x));
  layer.y = Math.max(-layer.height + minVisible, Math.min(canvas.height - minVisible, layer.y));
}

function shiftBgAnnotationItem(item, offsetX, offsetY) {
  if (item.type === "magnifier") {
    item.sourceX += offsetX;
    item.sourceY += offsetY;
    item.lensX += offsetX;
    item.lensY += offsetY;
    return;
  }
  if (item.type === "pen") {
    item.points = (item.points || []).map(point => ({ x: point.x + offsetX, y: point.y + offsetY }));
    return;
  }
  item.x += offsetX;
  item.y += offsetY;
}

function shiftBlueBgInteraction(offsetX, offsetY) {
  const interaction = blueBgState.interaction;
  if (!interaction) return;
  if (interaction.start) {
    interaction.start.x += offsetX;
    interaction.start.y += offsetY;
  }
  if (interaction.original) {
    interaction.original.x += offsetX;
    interaction.original.y += offsetY;
  }
  interaction.originals?.forEach(original => {
    original.x += offsetX;
    original.y += offsetY;
  });
  interaction.annotationOriginals?.forEach(original => {
    shiftBgAnnotationItem(original, offsetX, offsetY);
  });
}

function shiftBgAnnotationInteraction(offsetX, offsetY) {
  const interaction = bgAnnotationState.interaction;
  if (!interaction) return;
  if (interaction.start) {
    interaction.start.x += offsetX;
    interaction.start.y += offsetY;
  }
  if (interaction.original) {
    shiftBgAnnotationItem(interaction.original, offsetX, offsetY);
  }
  interaction.originals?.forEach(original => {
    shiftBgAnnotationItem(original, offsetX, offsetY);
  });
}

function expandTransparentBlueBgCanvas() {
  if (blueBgState.backgroundType !== "transparent" || !blueBgState.layers.length) return false;
  const canvas = blueBgCanvas();
  const bounds = blueBgTransparentExportBounds();
  if (!bounds) return false;
  const oldWidth = canvas.width;
  const oldHeight = canvas.height;
  const stage = $("#blueBgStage");
  const previousScrollLeft = stage?.scrollLeft || 0;
  const previousScrollTop = stage?.scrollTop || 0;
  const rect = canvas.getBoundingClientRect();
  const displayScaleX = rect.width / Math.max(1, oldWidth);
  const displayScaleY = rect.height / Math.max(1, oldHeight);
  const margin = Math.max(160, Math.round(Math.min(oldWidth, oldHeight) * 0.12));
  const leftGrowth = Math.max(0, Math.ceil(margin - bounds.x));
  const topGrowth = Math.max(0, Math.ceil(margin - bounds.y));
  const rightGrowth = Math.max(0, Math.ceil(bounds.x + bounds.width + margin - oldWidth));
  const bottomGrowth = Math.max(0, Math.ceil(bounds.y + bounds.height + margin - oldHeight));
  if (!leftGrowth && !topGrowth && !rightGrowth && !bottomGrowth) return false;

  blueBgState.layers.forEach(layer => {
    layer.x += leftGrowth;
    layer.y += topGrowth;
  });
  bgAnnotationState.items.forEach(item => shiftBgAnnotationItem(item, leftGrowth, topGrowth));
  shiftBlueBgInteraction(leftGrowth, topGrowth);
  shiftBgAnnotationInteraction(leftGrowth, topGrowth);
  blueBgState.canvasWidth = oldWidth + leftGrowth + rightGrowth;
  blueBgState.canvasHeight = oldHeight + topGrowth + bottomGrowth;
  canvas.width = blueBgState.canvasWidth;
  canvas.height = blueBgState.canvasHeight;
  blueBgState.baseDisplayWidth = blueBgState.canvasWidth * displayScaleX / Math.max(0.01, blueBgState.zoom);
  blueBgState.baseDisplayHeight = blueBgState.canvasHeight * displayScaleY / Math.max(0.01, blueBgState.zoom);
  canvas.style.width = `${blueBgState.canvasWidth * displayScaleX}px`;
  canvas.style.height = `${blueBgState.canvasHeight * displayScaleY}px`;
  const annotationCanvas = $("#bgAnnotationCanvas");
  annotationCanvas.width = blueBgState.canvasWidth;
  annotationCanvas.height = blueBgState.canvasHeight;
  syncBgAnnotationBox(canvas);
  if (stage) {
    stage.scrollLeft = previousScrollLeft + leftGrowth * displayScaleX;
    stage.scrollTop = previousScrollTop + topGrowth * displayScaleY;
  }
  return true;
}

async function addBlueBgFiles(fileList, reset = false) {
  const files = Array.from(fileList || []);
  if (!files.length) return;
  if (reset) {
    blueBgState.layers = [];
    blueBgState.selectedId = null;
    blueBgState.selectedIds = [];
    blueBgState.nextId = 1;
    blueBgState.sourceName = files[0].name;
    bgAnnotationState.items = [];
    bgAnnotationState.selectedId = null;
    bgAnnotationState.selectedIds = [];
    bgAnnotationState.selectedPart = null;
    bgAnnotationState.nextId = 1;
    bgAnnotationState.nextNumber = 1;
    bgAnnotationState.numberSize = ANNOTATION_NUMBER_SIZE;
  }
  const available = BLUE_BG_MAX_LAYERS - blueBgState.layers.length;
  const accepted = files.slice(0, Math.max(0, available));
  for (const file of accepted) {
    const { image, fileName } = await loadBlueBgFile(file);
    const materialIndex = bgMaterials.findIndex(candidate => candidate.file === file);
    const material = bgMaterials[materialIndex];
    if (material) material.unused = false;
    const fit = Math.min(
      blueBgCanvas().width * 0.68 / image.naturalWidth,
      blueBgCanvas().height * 0.72 / image.naturalHeight
    );
    const width = Math.max(80, image.naturalWidth * fit);
    const height = image.naturalHeight * fit;
    const detectedCornerRadius = detectImageCornerRadius(image);
    const offset = blueBgState.layers.length * 46;
    const layer = {
      id: blueBgState.nextId++,
      image,
      fileName,
      materialIndex,
      previewUrl: material?.previewUrl || "",
      baseWidth: image.naturalWidth,
      baseHeight: image.naturalHeight,
      fitWidth: width,
      fitHeight: height,
      aspect: image.naturalWidth / image.naturalHeight,
      width,
      height,
      x: (blueBgCanvas().width - width) / 2 + offset,
      y: (blueBgCanvas().height - height) / 2 + offset,
      shadow: true,
      round: true,
      unused: false,
      // 圆角值使用最终 2000px 画布中的绝对像素，不随素材分辨率或缩放
      // 反复变化。已有透明圆角由绘制阶段直接保留原始 alpha。
      cornerRadius: SYSTEM_CORNER_RADIUS,
      cornerAuto: true,
      corners: "1111",
      hasTransparentCorners: detectedCornerRadius > 0,
    };
    clampBlueBgLayer(layer);
    blueBgState.layers.push(layer);
    blueBgState.selectedId = layer.id;
    blueBgState.selectedIds = [];
  }
  if (accepted.length) {
    blueBgState.toolMode = "move";
    setBgInspectorMode("effects");
  }
  updateBlueBgControls();
  renderBlueBgCanvas();
  syncActiveBgTabTitle();
  pushBgHistory();
  const ignored = files.length - accepted.length;
  blueBgStatus(
    ignored > 0
      ? `最多支持 ${BLUE_BG_MAX_LAYERS} 张图片，已忽略 ${ignored} 张。`
      : `已放入 ${blueBgState.layers.length} 张图片。拖动调整位置，拖动四角调整大小。`
  );
}

async function startBlueBgPreview(files) {
  if (!files?.length) throw new Error("请先选择至少一张图片。");
  const firstImage = await loadBlueBgFile(files[0]);
  await ensureUnifiedBgBackground(firstImage.image);
  $("#blueBgEditor").hidden = false;
  await addBlueBgFiles(files, true);
  resetBlueBgZoom();
}

function blueBgPointerPosition(event) {
  const canvas = blueBgCanvas();
  const rect = canvas.getBoundingClientRect();
  return {
    x: (event.clientX - rect.left) * canvas.width / rect.width,
    y: (event.clientY - rect.top) * canvas.height / rect.height,
  };
}

function blueBgPointInLayer(layer, point) {
  const bounds = selectionFrameBounds(
    blueBgCanvas(),
    blueBgLayerVisualGeometry(layer).bounds
  );
  return point.x >= bounds.x && point.x <= bounds.x + bounds.width &&
    point.y >= bounds.y && point.y <= bounds.y + bounds.height;
}

function blueBgHitHandle(layer, point) {
  if (!layer) return null;
  return hitSelectionHandle(
    selectionFrameBounds(blueBgCanvas(), blueBgLayerVisualGeometry(layer).bounds),
    point,
    blueBgCanvas(),
    14
  );
}

function blueBgAlignmentTargets(excludedIds = []) {
  const canvas = blueBgCanvas();
  const excluded = new Set(excludedIds);
  const x = [0, canvas.width / 2, canvas.width];
  const y = [0, canvas.height / 2, canvas.height];
  blueBgState.layers.forEach(layer => {
    if (excluded.has(layer.id)) return;
    const bounds = blueBgLayerVisualGeometry(layer).bounds;
    x.push(bounds.x, bounds.x + bounds.width / 2, bounds.x + bounds.width);
    y.push(bounds.y, bounds.y + bounds.height / 2, bounds.y + bounds.height);
  });
  const unique = values => [...new Set(values.map(value => Math.round(value * 1000) / 1000))];
  return { x: unique(x), y: unique(y) };
}

function snapBlueBgBounds(bounds, excludedIds = [], tolerancePx = 12) {
  const canvas = blueBgCanvas();
  const rect = canvas.getBoundingClientRect();
  const toleranceX = tolerancePx * canvas.width / Math.max(1, rect.width);
  const toleranceY = tolerancePx * canvas.height / Math.max(1, rect.height);
  const targets = blueBgAlignmentTargets(excludedIds);
  const xEdges = [bounds.x, bounds.x + bounds.width / 2, bounds.x + bounds.width];
  const yEdges = [bounds.y, bounds.y + bounds.height / 2, bounds.y + bounds.height];
  const bestMatch = (edges, values, tolerance) => edges
    .flatMap(edge => values.map(target => ({ target, offset: target - edge, distance: Math.abs(target - edge) })))
    .filter(match => match.distance <= tolerance)
    .sort((a, b) => a.distance - b.distance)[0] || null;
  const xMatch = bestMatch(xEdges, targets.x, toleranceX);
  const yMatch = bestMatch(yEdges, targets.y, toleranceY);
  return {
    x: bounds.x + (xMatch?.offset || 0),
    y: bounds.y + (yMatch?.offset || 0),
    guides: {
      vertical: xMatch ? [xMatch.target] : [],
      horizontal: yMatch ? [yMatch.target] : [],
    },
  };
}

function blueBgPointerDown(event) {
  if (event.button > 0 || !blueBgState.layers.length) return;
  if (blueBgState.inspectorMode === "background") closeBgBackgroundPanel();
  const canvas = blueBgCanvas();
  blueBgState.snapGuides = emptySnapGuides();
  const point = blueBgPointerPosition(event);
  const selectedLayers = selectedBlueBgLayers();
  const hadSelection = selectedLayers.length > 0;
  const layer = [...blueBgState.layers].reverse().find(candidate => blueBgPointInLayer(candidate, point));
  const multiKey = event.metaKey || event.ctrlKey;
  if (multiKey) {
    if (layer) {
      const ids = new Set(selectedLayers.map(candidate => candidate.id));
      const adding = !ids.has(layer.id);
      if (adding) ids.add(layer.id);
      else ids.delete(layer.id);
      blueBgState.selectedIds = [...ids];
      blueBgState.selectedId = adding ? layer.id : (blueBgState.selectedIds.at(-1) ?? null);
      const updatedSelection = selectedBlueBgLayers();
      blueBgState.interaction = adding ? {
        mode: updatedSelection.length > 1 ? "move-group" : "move",
        id: layer.id,
        start: point,
        startClient: { x: event.clientX, y: event.clientY },
        moved: false,
        original: { ...layer },
        originals: updatedSelection.map(candidate => ({ id: candidate.id, x: candidate.x, y: candidate.y })),
      } : null;
      if (!updatedSelection.length) {
        const hasSelectedAnnotation = bgAnnotationState.selectedId !== null || bgAnnotationState.selectedIds.length > 0;
        blueBgState.toolMode = hasSelectedAnnotation ? "move" : "background";
        setBgInspectorMode(hasSelectedAnnotation ? "annotation" : "background");
      }
    } else {
      blueBgState.interaction = null;
    }
    $("#blueBgStage").setPointerCapture?.(event.pointerId);
    $("#blueBgStage").focus();
    updateBlueBgControls();
    renderBlueBgCanvas();
    event.preventDefault();
    return;
  }
  const handleTarget = [...selectedLayers]
    .reverse()
    .map(candidate => ({ layer: candidate, handle: blueBgHitHandle(candidate, point) }))
    .find(candidate => candidate.handle);
  if (handleTarget) {
    const selectedAnnotations = withAnnotationState(bgAnnotationState, () => selectedAnnotationItems());
    const resizeCombined = selectedLayers.length + selectedAnnotations.length > 1;
    blueBgState.interaction = {
      mode: resizeCombined ? "resize-combined" : "resize",
      id: handleTarget.layer.id,
      handle: handleTarget.handle,
      start: point,
      original: { ...handleTarget.layer },
      originals: resizeCombined
        ? selectedLayers.map(candidate => ({ ...candidate }))
        : null,
      annotationOriginals: resizeCombined
        ? selectedAnnotations.map(item => ({
            ...item,
            ...(item.type === "pen" ? { points: (item.points || []).map(penPoint => ({ ...penPoint })) } : {}),
          }))
        : null,
    };
  } else {
    const movingSelection = layer && selectedLayers.some(candidate => candidate.id === layer.id);
    if (!movingSelection) {
      blueBgState.selectedId = layer?.id ?? null;
      blueBgState.selectedIds = [];
    }
    blueBgState.interaction = layer ? {
      mode: movingSelection && selectedLayers.length > 1 ? "move-group" : "move",
      id: layer.id,
      start: point,
      startClient: { x: event.clientX, y: event.clientY },
      moved: false,
      original: { ...layer },
      originals: movingSelection
        ? selectedLayers.map(candidate => ({ id: candidate.id, x: candidate.x, y: candidate.y }))
        : null,
    } : null;
  }
  $("#blueBgStage").setPointerCapture?.(event.pointerId);
  $("#blueBgStage").focus();
  updateBlueBgControls();
  renderBlueBgCanvas();
  if (!layer && hadSelection) blueBgStatus("已取消框选。");
  event.preventDefault();
}

function scaleAnnotationItemFromAnchor(item, original, anchor, scale) {
  const scalePoint = (x, y) => ({
    x: anchor.x + (x - anchor.x) * scale,
    y: anchor.y + (y - anchor.y) * scale,
  });
  if (original.type === "number") {
    const point = scalePoint(original.x, original.y);
    item.x = point.x;
    item.y = point.y;
    item.size = Math.max(1, annotationNumberSize(original) * scale);
    return;
  }
  if (original.type === "magnifier") {
    const source = scalePoint(original.sourceX, original.sourceY);
    const lens = scalePoint(original.lensX, original.lensY);
    item.sourceX = source.x;
    item.sourceY = source.y;
    item.lensX = lens.x;
    item.lensY = lens.y;
    item.sourceRadius = Math.max(1, original.sourceRadius * scale);
    item.lensRadius = Math.max(1, original.lensRadius * scale);
    item.lineWidth = Math.max(1, original.lineWidth * scale);
    return;
  }
  if (original.type === "pen") {
    item.points = (original.points || []).map(point => scalePoint(point.x, point.y));
    item.lineWidth = Math.max(1, original.lineWidth * scale);
    return;
  }
  const topLeft = scalePoint(original.x, original.y);
  item.x = topLeft.x;
  item.y = topLeft.y;
  item.width = Math.max(1, original.width * scale);
  item.height = Math.max(1, original.height * scale);
  if (original.type === "mask") {
    item.cornerRadius = Math.max(0, (Number(original.cornerRadius) || 0) * scale);
  }
}

function scaleCombinedBgSelection(interaction, resizedLayer, centered) {
  const original = interaction.original;
  const scale = Math.max(0.01, resizedLayer.width / Math.max(1, original.width));
  const anchor = centered
    ? { x: original.x + original.width / 2, y: original.y + original.height / 2 }
    : {
        x: interaction.handle.includes("w") ? original.x + original.width : original.x,
        y: interaction.handle.includes("n") ? original.y + original.height : original.y,
      };
  interaction.originals.forEach(layerOriginal => {
    const candidate = blueBgState.layers.find(item => item.id === layerOriginal.id);
    if (!candidate) return;
    candidate.x = anchor.x + (layerOriginal.x - anchor.x) * scale;
    candidate.y = anchor.y + (layerOriginal.y - anchor.y) * scale;
    candidate.width = Math.max(1, layerOriginal.width * scale);
    candidate.height = Math.max(1, layerOriginal.height * scale);
  });
  withAnnotationState(bgAnnotationState, () => {
    interaction.annotationOriginals.forEach(annotationOriginal => {
      const candidate = bgAnnotationState.items.find(item => item.id === annotationOriginal.id);
      if (!candidate) return;
      scaleAnnotationItemFromAnchor(candidate, annotationOriginal, anchor, scale);
    });
  });
}

function blueBgPointerMove(event) {
  const interaction = blueBgState.interaction;
  if (!interaction) {
    const selectedLayers = selectedBlueBgLayers();
    const point = blueBgPointerPosition(event);
    const handle = [...selectedLayers]
      .reverse()
      .map(layer => blueBgHitHandle(layer, point))
      .find(Boolean);
    const cursor = selectionCursorByHandle[handle] ||
      (blueBgState.layers.some(layer => blueBgPointInLayer(layer, point)) ? "move" : "default");
    blueBgCanvas().style.cursor = cursor;
    $("#blueBgStage").style.cursor = cursor;
    return;
  }
  const layer = blueBgState.layers.find(candidate => candidate.id === interaction.id);
  if (!layer) return;
  const point = blueBgPointerPosition(event);
  if (["move", "move-group", "move-combined"].includes(interaction.mode) && !interaction.moved) {
    const distance = Math.hypot(
      event.clientX - interaction.startClient.x,
      event.clientY - interaction.startClient.y
    );
    // 单击时触控板/鼠标会产生极小的 pointermove。超过 4px 后才进入
    // 真正拖动，避免“点选一下，图片同时往上跳”。
    if (distance < 4) return;
    interaction.moved = true;
  }
  if (interaction.mode === "move-combined") {
    const dx = point.x - interaction.start.x;
    const dy = point.y - interaction.start.y;
    interaction.originals.forEach(original => {
      const candidate = blueBgState.layers.find(item => item.id === original.id);
      if (!candidate) return;
      candidate.x = original.x + dx;
      candidate.y = original.y + dy;
      clampBlueBgLayer(candidate);
    });
    withAnnotationState(bgAnnotationState, () => {
      interaction.annotationOriginals.forEach(original => {
        const candidate = bgAnnotationState.items.find(item => item.id === original.id);
        if (!candidate) return;
        translateAnnotationItem(candidate, original, dx, dy);
        clampAnnotationItem(candidate);
      });
    });
    blueBgState.snapGuides = emptySnapGuides();
  } else if (interaction.mode === "move-group") {
    const dx = point.x - interaction.start.x;
    const dy = point.y - interaction.start.y;
    interaction.originals.forEach(original => {
      const candidate = blueBgState.layers.find(item => item.id === original.id);
      if (!candidate) return;
      candidate.x = original.x + dx;
      candidate.y = original.y + dy;
    });
    const bounds = blueBgSelectionBounds();
    const snapped = snapBlueBgBounds(bounds, selectedBlueBgLayers().map(candidate => candidate.id));
    const offsetX = snapped.x - bounds.x;
    const offsetY = snapped.y - bounds.y;
    selectedBlueBgLayers().forEach(candidate => {
      candidate.x += offsetX;
      candidate.y += offsetY;
      clampBlueBgLayer(candidate);
    });
    blueBgState.snapGuides = snapped.guides;
  } else if (interaction.mode === "move") {
    layer.x = interaction.original.x + point.x - interaction.start.x;
    layer.y = interaction.original.y + point.y - interaction.start.y;
    const visualBounds = blueBgLayerVisualGeometry(layer).bounds;
    const snapped = snapBlueBgBounds(visualBounds, [layer.id]);
    layer.x += snapped.x - visualBounds.x;
    layer.y += snapped.y - visualBounds.y;
    blueBgState.snapGuides = snapped.guides;
  } else {
    const canvas = blueBgCanvas();
    const rect = canvas.getBoundingClientRect();
    const toleranceX = 12 * canvas.width / Math.max(1, rect.width);
    const toleranceY = 12 * canvas.height / Math.max(1, rect.height);
    const frameMargin = canvasDisplayUnit(canvas);
    const targets = blueBgAlignmentTargets(
      interaction.mode === "resize-combined"
        ? interaction.originals.map(candidate => candidate.id)
        : [layer.id]
    );
    const visualEdgePoint = {
      x: interaction.handle.includes("w")
        ? point.x + frameMargin
        : interaction.handle.includes("e")
          ? point.x - frameMargin
          : point.x,
      y: interaction.handle.includes("n")
        ? point.y + frameMargin
        : interaction.handle.includes("s")
          ? point.y - frameMargin
          : point.y,
    };
    const xSnap = interaction.handle.includes("w") || interaction.handle.includes("e")
      ? nearestSnap(visualEdgePoint.x, targets.x, toleranceX)
      : null;
    const ySnap = interaction.handle.includes("n") || interaction.handle.includes("s")
      ? nearestSnap(visualEdgePoint.y, targets.y, toleranceY)
      : null;
    const visualGeometry = blueBgLayerVisualGeometry(interaction.original);
    const resizePoint = {
      x: xSnap?.value ?? visualEdgePoint.x,
      y: ySnap?.value ?? visualEdgePoint.y,
    };
    if (interaction.handle.includes("w")) resizePoint.x += visualGeometry.outsets.left;
    if (interaction.handle.includes("e")) resizePoint.x -= visualGeometry.outsets.right;
    if (interaction.handle.includes("n")) resizePoint.y += visualGeometry.outsets.top;
    if (interaction.handle.includes("s")) resizePoint.y -= visualGeometry.outsets.bottom;
    blueBgState.snapGuides = {
      vertical: xSnap ? [xSnap.value] : [],
      horizontal: ySnap ? [ySnap.value] : [],
    };
    const centered = event.altKey || event.ctrlKey;
    const resized = resizeBoundsWithModifiers(interaction.original, interaction.handle, resizePoint, {
      minWidth: 20,
      minHeight: 20,
      preserveAspect: interaction.mode === "resize-combined" || !event.shiftKey,
      centered,
    });
    if (interaction.mode === "resize-combined" || !event.shiftKey || centered) {
      const minScale = 0.1;
      const maxScale = 5;
      const scale = Math.max(
        minScale,
        Math.min(maxScale, resized.width / interaction.original.fitWidth)
      );
      const width = interaction.original.fitWidth * scale;
      const height = interaction.original.fitHeight * scale;
      if (centered) {
        const centerX = interaction.original.x + interaction.original.width / 2;
        const centerY = interaction.original.y + interaction.original.height / 2;
        layer.x = centerX - width / 2;
        layer.y = centerY - height / 2;
      } else {
        layer.x = interaction.handle.includes("w")
          ? interaction.original.x + interaction.original.width - width
          : interaction.handle.includes("e")
            ? interaction.original.x
            : interaction.original.x + (interaction.original.width - width) / 2;
        layer.y = interaction.handle.includes("n")
          ? interaction.original.y + interaction.original.height - height
          : interaction.handle.includes("s")
            ? interaction.original.y
            : interaction.original.y + (interaction.original.height - height) / 2;
      }
      layer.width = width;
      layer.height = height;
    } else {
      Object.assign(layer, resized);
    }
    if (interaction.mode === "resize-combined") {
      scaleCombinedBgSelection(interaction, layer, centered);
    }
  }
  if (interaction.mode !== "resize-combined") clampBlueBgLayer(layer);
  expandTransparentBlueBgCanvas();
  updateBlueBgControls();
  renderBlueBgCanvas();
  event.preventDefault();
}

function blueBgPointerUp(event) {
  if (!blueBgState.interaction) return;
  const interaction = blueBgState.interaction;
  blueBgState.interaction = null;
  $("#blueBgStage").releasePointerCapture?.(event.pointerId);
  const snapped = blueBgState.snapGuides.vertical.length || blueBgState.snapGuides.horizontal.length;
  blueBgState.snapGuides = emptySnapGuides();
  renderBlueBgCanvas();
  if (["move", "move-group", "move-combined"].includes(interaction.mode) && !interaction.moved) {
    blueBgStatus(
      interaction.mode === "move-combined"
        ? `已保持 ${selectedBlueBgLayers().length} 张前景图和 ${withAnnotationState(bgAnnotationState, () => selectedAnnotationItems().length)} 个标注的组合选择。`
        : `已选择前景图 · 共 ${blueBgState.layers.length} 张图片`
    );
    return;
  }
  pushBgHistory();
  blueBgStatus(
    interaction.mode === "move-combined"
      ? `已统一移动 ${selectedBlueBgLayers().length} 张前景图和 ${withAnnotationState(bgAnnotationState, () => selectedAnnotationItems().length)} 个标注。`
      : `${snapped ? "已吸附到图像或画布参考线" : "已保存当前调整"} · 共 ${blueBgState.layers.length} 张图片`
  );
}

function bgAnnotationHitAtEvent(event) {
  if (!bgAnnotationState.items.length) return false;
  return withAnnotationState(bgAnnotationState, () => {
    const point = annotationPointerPosition(event);
    const selected = selectedAnnotationItems();
    const handle = [...selected].reverse().some(item => Boolean(hitAnnotationHandle(item, point)));
    const item = [...annotationState.items].reverse().some(candidate => pointInAnnotationItem(candidate, point));
    return handle || item;
  });
}

function selectedBlueBgHandleAtEvent(event) {
  if (!blueBgState.layers.length) return null;
  const point = blueBgPointerPosition(event);
  return [...selectedBlueBgLayers()]
    .reverse()
    .map(layer => ({ layer, handle: blueBgHitHandle(layer, point) }))
    .find(candidate => candidate.handle) || null;
}

function blueBgLayerHitAtEvent(event) {
  if (!blueBgState.layers.length) return false;
  const point = blueBgPointerPosition(event);
  return selectedBlueBgLayers().some(layer => Boolean(blueBgHitHandle(layer, point))) ||
    [...blueBgState.layers].reverse().some(layer => blueBgPointInLayer(layer, point));
}

function startCombinedBgSelectionMove(event) {
  const selectedLayers = selectedBlueBgLayers();
  const selectedAnnotations = withAnnotationState(bgAnnotationState, () => selectedAnnotationItems());
  if (!selectedLayers.length || !selectedAnnotations.length) return false;
  const point = blueBgPointerPosition(event);
  const hitsSelectedLayer = selectedLayers.some(layer => blueBgPointInLayer(layer, point));
  const hitsSelectedAnnotation = withAnnotationState(bgAnnotationState, () =>
    selectedAnnotations.some(item => pointInAnnotationItem(item, point))
  );
  if (!hitsSelectedLayer && !hitsSelectedAnnotation) return false;
  // 点到任一对象的尺寸手柄时，继续走原有的单对象尺寸调整；只有拖动内容本体才组合移动。
  const hitsLayerHandle = selectedLayers.some(layer => Boolean(blueBgHitHandle(layer, point)));
  const hitsAnnotationHandle = withAnnotationState(bgAnnotationState, () =>
    selectedAnnotations.some(item => Boolean(hitAnnotationHandle(item, point)))
  );
  if (hitsLayerHandle || hitsAnnotationHandle) return false;
  blueBgState.toolMode = "move";
  blueBgState.snapGuides = emptySnapGuides();
  blueBgState.interaction = {
    mode: "move-combined",
    id: selectedLayers[0].id,
    start: point,
    startClient: { x: event.clientX, y: event.clientY },
    moved: false,
    originals: selectedLayers.map(layer => ({ id: layer.id, x: layer.x, y: layer.y })),
    annotationOriginals: selectedAnnotations.map(item => ({
      ...item,
      ...(item.type === "pen" ? { points: (item.points || []).map(point => ({ ...point })) } : {}),
    })),
  };
  $("#blueBgStage").setPointerCapture?.(event.pointerId);
  $("#blueBgStage").focus();
  setBgInspectorMode("effects");
  updateBlueBgControls();
  renderBlueBgCanvas();
  event.preventDefault();
  return true;
}

function blueBgStagePointerDown(event) {
  if (event.button > 0 || event.target.closest(".blue-bg-context-menu")) return;
  annotationState = bgAnnotationState;
  const multiKey = event.metaKey || event.ctrlKey;
  if (event.target === $("#blueBgStage")) {
    const hadSelection = blueBgState.selectedId !== null || blueBgState.selectedIds.length ||
      bgAnnotationState.selectedId !== null || bgAnnotationState.selectedIds.length;
    clearAllBgCanvasSelections();
    openBgBackgroundDialog();
    $("#blueBgStage").focus();
    if (hadSelection) blueBgStatus("已取消框选。");
    event.preventDefault();
    return;
  }
  if (!multiKey && startCombinedBgSelectionMove(event)) return;
  if (blueBgState.toolMode !== "annotation" && selectedBlueBgHandleAtEvent(event)) {
    blueBgState.toolMode = "move";
    setBgInspectorMode("effects");
    blueBgPointerDown(event);
    return;
  }
  if (blueBgState.toolMode === "annotation" || bgAnnotationHitAtEvent(event)) {
    if (!multiKey) {
      blueBgState.selectedId = null;
      blueBgState.selectedIds = [];
      blueBgState.interaction = null;
      syncCanvasSelectionOverlays($("#blueBgStage"), blueBgCanvas(), $("#blueBgSelectionOverlay"), []);
    }
    if (blueBgState.toolMode !== "annotation") annotationState.mode = "view";
    setBgInspectorMode("annotation");
    annotationPointerDown(event);
    return;
  }
  const hadSelection = blueBgState.selectedId !== null || blueBgState.selectedIds.length ||
    bgAnnotationState.selectedId !== null || bgAnnotationState.selectedIds.length;
  if (!multiKey) clearBgAnnotationSelection();
  if (!blueBgLayerHitAtEvent(event)) {
    clearBlueBgSelection();
    $("#blueBgStage").focus();
    openBgBackgroundDialog();
    if (hadSelection) blueBgStatus("已取消框选。");
    return;
  }
  blueBgState.toolMode = "move";
  setBgInspectorMode("effects");
  blueBgPointerDown(event);
}

function blueBgStagePointerMove(event) {
  annotationState = bgAnnotationState;
  if (blueBgState.interaction ||
      (blueBgState.toolMode !== "annotation" && !bgAnnotationState.interaction && selectedBlueBgHandleAtEvent(event))) {
    blueBgPointerMove(event);
  } else if (bgAnnotationState.interaction || blueBgState.toolMode === "annotation" || bgAnnotationHitAtEvent(event)) {
    annotationPointerMove(event);
  } else {
    blueBgPointerMove(event);
  }
}

function blueBgStagePointerUp(event) {
  annotationState = bgAnnotationState;
  if (bgAnnotationState.interaction) annotationPointerUp(event);
  else blueBgPointerUp(event);
}

function hideBlueBgContextMenu() {
  $("#blueBgContextMenu").hidden = true;
}

function blueBgContextMenu(event) {
  if (!blueBgState.layers.length) return;
  const point = blueBgPointerPosition(event);
  const layer = [...blueBgState.layers].reverse().find(candidate => blueBgPointInLayer(candidate, point));
  if (!layer) return;
  event.preventDefault();
  showBlueBgContextMenuForLayer(layer, event.clientX, event.clientY);
}

function showBlueBgContextMenuForLayer(layer, clientX, clientY) {
  if (!layer) return;
  blueBgState.selectedId = layer.id;
  blueBgState.selectedIds = [];
  clearBgAnnotationSelection();
  blueBgState.toolMode = "move";
  setBgInspectorMode("effects");
  updateBlueBgControls();
  renderBlueBgCanvas();
  showBlueBgContextMenuForMaterial(layer.materialIndex, clientX, clientY);
}

function showBlueBgContextMenuForMaterial(materialIndex, clientX, clientY) {
  const material = bgMaterials[materialIndex];
  if (!material) return;
  bgContextMaterialIndex = materialIndex;
  const layer = blueBgState.layers.find(item => item.materialIndex === materialIndex);
  if (!layer) {
    clearAllBgCanvasSelections();
    blueBgState.toolMode = "background";
    setBgInspectorMode("background");
    updateBlueBgControls();
    renderBlueBgCanvas();
  }
  const menu = $("#blueBgContextMenu");
  const order = orderedBgMaterialIndexes();
  const position = order.indexOf(materialIndex);
  $("#blueBgMoveUp").disabled = position <= 0;
  $("#blueBgMoveDown").disabled = position < 0 || position === order.length - 1;
  $("#blueBgEditSelected").disabled = !material.file;
  menu.style.left = `${Math.min(clientX, window.innerWidth - 160)}px`;
  menu.style.top = `${Math.min(clientY, window.innerHeight - 174)}px`;
  menu.hidden = false;
}

let bgChoiceContext = null;

function hideBgChoiceContextMenu() {
  const menu = $("#bgChoiceContextMenu");
  if (menu) menu.hidden = true;
  bgChoiceContext = null;
}

function showBgChoiceContextMenu(tile, clientX, clientY) {
  const kind = tile.dataset.bgCustomGradient ? "gradient"
    : tile.dataset.bgCustomAspect ? "aspect"
      : tile.dataset.bgType === "wallpaper" ? "wallpaper" : tile.dataset.bgAspect ? "aspect" : tile.dataset.bgType === "gradient" ? "gradient" : "";
  if (!kind) return;
  const custom = Boolean(tile.dataset.bgCustomGradient || tile.dataset.bgCustomAspect || tile.dataset.bgCustom === "true");
  bgChoiceContext = { kind, custom, id: kind === "gradient" ? tile.dataset.bgGradient : kind === "aspect" ? tile.dataset.bgAspect : tile.dataset.bgWallpaper };
  const menu = $("#bgChoiceContextMenu");
  const remove = $("#bgChoiceRemove");
  remove.disabled = !custom;
  remove.title = custom ? "移除自定义项" : "仅支持移除自定义项";
  menu.style.left = `${Math.min(clientX, window.innerWidth - 160)}px`;
  menu.style.top = `${Math.min(clientY, window.innerHeight - 52)}px`;
  menu.hidden = false;
}

async function removeCustomBgChoice() {
  if (!bgChoiceContext?.custom) return;
  const { kind, id } = bgChoiceContext;
  if (kind === "gradient") {
    customBgGradients = customBgGradients.filter(item => item.id !== id);
    if ($("#bgBackgroundGradient").value === id) {
      $("#bgBackgroundType").value = "gradient";
      $("#bgBackgroundGradient").value = BG_GRADIENT_PRESETS[0].id;
    }
  } else if (kind === "aspect") {
    customBgAspects = customBgAspects.filter(item => item.value !== id);
    if ($("#bgCanvasAspect").value === id) $("#bgCanvasAspect").value = "default";
  } else {
    const wallpaper = customBgWallpapers.find(item => item.id === id);
    if (wallpaper?.url) URL.revokeObjectURL(wallpaper.url);
    customBgWallpapers = customBgWallpapers.filter(item => item.id !== id);
    if ($("#bgWallpaperSelect").value === id) {
      $("#bgBackgroundType").value = "wallpaper";
      $("#bgWallpaperSelect").value = SYSTEM_WALLPAPERS[0].id;
    }
  }
  hideBgChoiceContextMenu();
  renderBgWallpaperChoices();
  renderBgCustomChoices();
  await applyBgBackgroundFromTiles();
}

function orderedBgMaterialIndexes() {
  return bgMaterials
    .map((material, index) => ({ material, index }))
    .sort((a, b) => (Number(b.material.stackOrder) || 0) - (Number(a.material.stackOrder) || 0))
    .map(item => item.index);
}

function normalizeBgMaterialStackOrder(order) {
  order.forEach((materialIndex, position) => {
    if (bgMaterials[materialIndex]) bgMaterials[materialIndex].stackOrder = order.length - position;
  });
  bgMaterialStackSequence = order.length + 1;
}

function syncBlueBgLayersToMaterialOrder() {
  const order = orderedBgMaterialIndexes();
  const layersByMaterial = new Map(
    blueBgState.layers
      .filter(layer => Number.isInteger(layer.materialIndex))
      .map(layer => [layer.materialIndex, layer])
  );
  const orderedLayers = order.map(index => layersByMaterial.get(index)).filter(Boolean).reverse();
  const orderedIds = new Set(orderedLayers.map(layer => layer.id));
  blueBgState.layers = [
    ...blueBgState.layers.filter(layer => !orderedIds.has(layer.id)),
    ...orderedLayers,
  ];
}

function applyBgMaterialOrder(order, selectedIndex, message = "已更新素材与前景图层级。") {
  normalizeBgMaterialStackOrder(order);
  syncBlueBgLayersToMaterialOrder();
  bgContextMaterialIndex = selectedIndex;
  const selectedLayer = blueBgState.layers.find(layer => layer.materialIndex === selectedIndex);
  if (selectedLayer) {
    blueBgState.selectedId = selectedLayer.id;
    blueBgState.selectedIds = [];
  }
  hideBlueBgContextMenu();
  updateBlueBgControls();
  renderBgMaterialList();
  renderBlueBgCanvas();
  pushBgHistory();
  blueBgStatus(message);
}

function moveContextBgMaterial(direction) {
  const order = orderedBgMaterialIndexes();
  const position = order.indexOf(bgContextMaterialIndex);
  const nextPosition = position + (direction > 0 ? -1 : 1);
  if (position < 0 || nextPosition < 0 || nextPosition >= order.length) return;
  [order[position], order[nextPosition]] = [order[nextPosition], order[position]];
  applyBgMaterialOrder(
    order,
    bgContextMaterialIndex,
    direction > 0 ? "所选素材已上移一层。" : "所选素材已下移一层。"
  );
}

function reorderBgMaterial(sourceIndex, targetIndex, placement) {
  if (sourceIndex === targetIndex) return;
  const order = orderedBgMaterialIndexes().filter(index => index !== sourceIndex);
  const targetPosition = order.indexOf(targetIndex);
  if (targetPosition < 0) return;
  order.splice(targetPosition + (placement === "after" ? 1 : 0), 0, sourceIndex);
  applyBgMaterialOrder(order, sourceIndex, "已按素材库顺序更新前景图层级。");
}

async function openSelectedBlueBgLayerInEditor() {
  const selectedLayer = selectedBlueBgLayer();
  const materialIndex = Number.isInteger(bgContextMaterialIndex)
    ? bgContextMaterialIndex
    : selectedLayer?.materialIndex;
  const material = Number.isInteger(materialIndex) ? bgMaterials[materialIndex] : null;
  if (!material?.file) return;
  const layer = blueBgState.layers.find(item => item.materialIndex === materialIndex) || null;
  hideBlueBgContextMenu();
  showTab("imageEditor");
  await loadImageEditorFile(material.file, { materialIndex, layerId: layer?.id ?? null });
  imageEditorStatus("已从美化 / 标注打开素材；编辑完成后按 Ctrl/⌘ S 同步回美化 / 标注。");
}

function deleteBgMaterialCompletely(materialIndex = bgContextMaterialIndex) {
  const material = bgMaterials[materialIndex];
  if (!material) return;
  // 历史记录仍会持有这一素材；保留对象 URL，确保撤销删除后预览可以恢复。
  if (material.renderTimer) window.clearTimeout(material.renderTimer);
  bgRenderControllers.get(material)?.abort();
  const removedLayerIds = new Set(
    blueBgState.layers.filter(layer => layer.materialIndex === materialIndex).map(layer => layer.id)
  );
  // 素材库被所有画布标签共享：删除素材时，其余标签页里引用该素材的
  // 图层也要一并移除，避免 materialIndex 错位指向别的图片。
  bgTabList.forEach(tab => {
    if (tab.canvas === blueBgState) return;
    tab.canvas.layers = tab.canvas.layers.filter(layer => layer.materialIndex !== materialIndex);
    tab.canvas.layers.forEach(layer => {
      if (Number.isInteger(layer.materialIndex) && layer.materialIndex > materialIndex) layer.materialIndex -= 1;
    });
    tab.canvas.selectedId = null;
    tab.canvas.selectedIds = [];
  });
  blueBgState.layers = blueBgState.layers.filter(layer => layer.materialIndex !== materialIndex);
  blueBgState.layers.forEach(layer => {
    if (Number.isInteger(layer.materialIndex) && layer.materialIndex > materialIndex) layer.materialIndex -= 1;
  });
  bgMaterials.splice(materialIndex, 1);
  normalizeBgMaterialStackOrder(orderedBgMaterialIndexes());
  if (imageEditorState.sourceBgMaterialIndex === materialIndex) {
    imageEditorState.sourceBgMaterialIndex = null;
    imageEditorState.sourceBgLayerId = null;
  } else if (imageEditorState.sourceBgMaterialIndex > materialIndex) {
    imageEditorState.sourceBgMaterialIndex -= 1;
  }
  if (removedLayerIds.has(blueBgState.selectedId) || blueBgState.selectedIds.some(id => removedLayerIds.has(id))) {
    clearAllBgCanvasSelections();
    openBgBackgroundDialog();
  }
  bgContextMaterialIndex = -1;
  hideBlueBgContextMenu();
  syncBgGeneratedResults();
  updateBlueBgControls();
  renderBgMaterialList();
  renderBlueBgCanvas();
  pushBgHistory();
  blueBgStatus("已从素材库和画布中删除该图片。");
}

async function syncImageEditorToBgMaterial() {
  const materialIndex = imageEditorState.sourceBgMaterialIndex;
  const material = Number.isInteger(materialIndex) ? bgMaterials[materialIndex] : null;
  if (!imageEditorState.hasImage || !material) {
    imageEditorStatus("当前图片不是从美化 / 标注打开的素材。");
    return false;
  }
  const blob = await new Promise(resolve => imageEditorState.documentCanvas.toBlob(resolve, "image/png"));
  if (!blob) throw new Error("生成编辑结果失败，请重试。");
  const baseName = (material.file?.name || imageEditorState.sourceName || "image").replace(/\.[^.]+$/, "");
  const file = new File([blob], `${baseName}.png`, { type: "image/png" });
  const previewUrl = URL.createObjectURL(file);
  let image;
  try {
    image = await loadImageSource(previewUrl);
  } catch (error) {
    URL.revokeObjectURL(previewUrl);
    throw error;
  }
  const oldPreviewUrl = material.previewUrl;
  if (material.outputUrl) URL.revokeObjectURL(material.outputUrl);
  material.file = file;
  material.previewUrl = previewUrl;
  material.outputBlob = null;
  material.outputUrl = "";
  material.renderVersion = (material.renderVersion || 0) + 1;
  const fit = Math.min(
    blueBgCanvas().width * 0.68 / image.naturalWidth,
    blueBgCanvas().height * 0.72 / image.naturalHeight
  );
  blueBgState.layers
    .filter(layer => layer.materialIndex === materialIndex)
    .forEach(layer => {
      const centerX = layer.x + layer.width / 2;
      const centerY = layer.y + layer.height / 2;
      const scale = layer.width / Math.max(1, layer.fitWidth);
      layer.image = image;
      layer.fileName = file.name;
      layer.previewUrl = previewUrl;
      layer.baseWidth = image.naturalWidth;
      layer.baseHeight = image.naturalHeight;
      layer.fitWidth = Math.max(80, image.naturalWidth * fit);
      layer.fitHeight = image.naturalHeight * fit;
      layer.aspect = image.naturalWidth / image.naturalHeight;
      layer.width = layer.fitWidth * scale;
      layer.height = layer.fitHeight * scale;
      layer.x = centerX - layer.width / 2;
      layer.y = centerY - layer.height / 2;
      layer.hasTransparentCorners = detectImageCornerRadius(image) > 0;
      clampBlueBgLayer(layer);
    });
  if (oldPreviewUrl) URL.revokeObjectURL(oldPreviewUrl);
  renderBgMaterialList();
  updateBlueBgControls();
  renderBlueBgCanvas();
  pushBgHistory();
  imageEditorStatus("已同步到美化 / 标注：素材预览和画布前景图均已更新。");
  return true;
}

function updateBlueBgLayerOptions() {
  const layers = selectedBlueBgLayers();
  if (!layers.length) return;
  layers.forEach(layer => {
    layer.shadow = $("#bgEffectShadow").checked;
    layer.round = $("#bgEffectRound").checked;
  });
  updateBlueBgControls();
  renderBlueBgCanvas();
}

function updateBlueBgLayerRadius() {
  const layers = selectedBlueBgLayers();
  if (!layers.length) return;
  const radius = Math.max(0, Math.min(128, Number($("#bgEffectRoundRadius").value) || 0));
  layers.forEach(layer => {
    layer.cornerRadius = radius;
    layer.cornerAuto = false;
  });
  updateBlueBgControls();
  renderBlueBgCanvas();
  blueBgStatus(`所选图片圆角 ${radius}px · 可继续拖动滑杆调整`);
}

// 切换某个角的圆角：点亮 / 熄灭都作用于当前选中的全部图层或素材。
function toggleBgCorner(key) {
  if (!BG_CORNER_KEYS.includes(key)) return;
  if ($("#bgBlueMode").checked) {
    const layers = selectedBlueBgLayers();
    if (!layers.length) return;
    const flags = bgCornerFlags(layers[0].corners);
    flags[key] = !flags[key];
    const corners = bgCornersFromFlags(flags);
    layers.forEach(layer => {
      layer.corners = corners;
      // 改成手动控制某一角后，不再沿用图片自带的透明圆角。
      layer.cornerAuto = false;
    });
    updateBlueBgControls();
    renderBlueBgCanvas();
    blueBgStatus(`圆角位置：${bgCornerLabel(corners)} · 可继续点选调整`);
    return;
  }
  const indexes = selectedDefaultBgMaterialIndexes();
  if (!indexes.length) return;
  const flags = bgCornerFlags(bgMaterials[indexes[0]].corners);
  flags[key] = !flags[key];
  const corners = bgCornersFromFlags(flags);
  indexes.forEach(index => {
    const material = bgMaterials[index];
    material.corners = corners;
    material.cornerAuto = false;
    material.outputBlob = null;
    scheduleDefaultBgMaterialRender(index);
  });
  syncBgEffectToolbar();
  syncBgGeneratedResults();
}

function updateBlueBgLayerScale() {
  const layers = selectedBlueBgLayers();
  if (!layers.length) return;
  const scale = Number($("#bgEffectScale").value) / 100;
  layers.forEach(layer => {
    const centerX = layer.x + layer.width / 2;
    const centerY = layer.y + layer.height / 2;
    layer.width = layer.fitWidth * scale;
    layer.height = layer.fitHeight * scale;
    layer.x = centerX - layer.width / 2;
    layer.y = centerY - layer.height / 2;
  });
  expandTransparentBlueBgCanvas();
  updateBlueBgControls();
  renderBlueBgCanvas();
  blueBgStatus(`所选图片缩放比例 ${Math.round(scale * 100)}% · 中心位置保持不变`);
}

function removeSelectedBlueBgLayers() {
  const deletedLayers = selectedBlueBgLayers();
  const ids = new Set(deletedLayers.map(layer => layer.id));
  if (!ids.size) return 0;
  blueBgState.layers = blueBgState.layers.filter(layer => !ids.has(layer.id));
  const remainingMaterialIndexes = new Set(
    blueBgState.layers.map(layer => layer.materialIndex).filter(index => Number.isInteger(index))
  );
  deletedLayers.forEach(layer => {
    const index = layer.materialIndex;
    if (Number.isInteger(index) && !remainingMaterialIndexes.has(index) && bgMaterials[index]) {
      bgMaterials[index].unused = true;
      bgMaterials[index].outputBlob = null;
      if (bgMaterials[index].outputUrl) {
        URL.revokeObjectURL(bgMaterials[index].outputUrl);
        bgMaterials[index].outputUrl = "";
      }
    }
  });
  syncBgGeneratedResults();
  blueBgState.selectedId = null;
  blueBgState.selectedIds = [];
  return ids.size;
}

function deleteBlueBgLayer() {
  const count = removeSelectedBlueBgLayers();
  if (!count) return;
  openBgBackgroundDialog();
  pushBgHistory();
  syncActiveBgTabTitle();
  blueBgStatus(`已移除 ${count} 张画布前景图，素材库保留并标记为未使用 · 共 ${blueBgState.layers.length} 张图片`);
}

function deleteSelectedBgCanvasItems() {
  annotationState = bgAnnotationState;
  const annotationIds = new Set(selectedAnnotationItems().map(item => item.id));
  const layerCount = removeSelectedBlueBgLayers();
  if (annotationIds.size) {
    bgAnnotationState.items = bgAnnotationState.items.filter(item => !annotationIds.has(item.id));
  }
  if (!layerCount && !annotationIds.size) return false;
  clearAllBgCanvasSelections();
  blueBgState.toolMode = "background";
  openBgBackgroundDialog();
  updateBlueBgControls();
  renderBlueBgCanvas();
  syncActiveBgTabTitle();
  pushBgHistory();
  const parts = [];
  if (layerCount) parts.push(`${layerCount} 张前景图`);
  if (annotationIds.size) parts.push(`${annotationIds.size} 个标注`);
  blueBgStatus(`已移除 ${parts.join("和")}；前景素材仍保留在素材库 · 共 ${blueBgState.layers.length} 张图片`);
  return true;
}

function blueBgKeyDown(event) {
  if (event.key.toLowerCase() === "v" && !event.metaKey && !event.ctrlKey && !event.altKey) {
    event.preventDefault();
    event.stopPropagation();
    clearAllBgCanvasSelections();
    openBgBackgroundDialog();
    blueBgStatus("已切换至背景美化。");
    return;
  }
  if (event.key === "Delete" || event.key === "Backspace") {
    if (deleteSelectedBgCanvasItems()) event.preventDefault();
    return;
  }
  if (blueBgState.toolMode === "annotation" || bgAnnotationState.selectedId !== null || bgAnnotationState.selectedIds.length) {
    annotationState = bgAnnotationState;
    annotationKeyDown(event);
    return;
  }
  const layers = selectedBlueBgLayers();
  if (!layers.length) return;
  const directions = {
    ArrowLeft: [-1, 0],
    ArrowRight: [1, 0],
    ArrowUp: [0, -1],
    ArrowDown: [0, 1],
  };
  const direction = directions[event.key];
  if (!direction) return;
  event.preventDefault();
  const step = event.shiftKey ? 10 : 1;
  layers.forEach(layer => {
    layer.x += direction[0] * step;
    layer.y += direction[1] * step;
    clampBlueBgLayer(layer);
  });
  expandTransparentBlueBgCanvas();
  renderBlueBgCanvas();
  blueBgStatus(`已微调 ${step}px · 共 ${blueBgState.layers.length} 张图片`);
}

function blueBgFilename() {
  const baseName = (blueBgState.sourceName || "image").replace(/\.[^.]+$/, "");
  return `${baseName}-小编盒子.png`;
}

function blueBgTransparentExportBounds() {
  const layerBounds = blueBgState.layers.map(layer => blueBgLayerVisualGeometry(layer).bounds);
  const annotationBounds = withAnnotationState(bgAnnotationState, () =>
    bgAnnotationState.items.map(annotationItemBounds)
  );
  return unionBounds([...layerBounds, ...annotationBounds]);
}

function blueBgTransparentExportScale(bounds) {
  const sourceDensity = Math.max(
    0.01,
    ...blueBgState.layers.map(layer => Math.max(
      layer.baseWidth / Math.max(1, layer.width),
      layer.baseHeight / Math.max(1, layer.height)
    ))
  );
  // 浏览器画布存在尺寸上限；只在确有必要时限制超大合成图，普通单图
  // 会严格使用素材自身的像素密度，不受 2000px 画布规格影响。
  const maxCanvasSide = 16384;
  return Math.min(
    sourceDensity,
    maxCanvasSide / Math.max(1, bounds.width),
    maxCanvasSide / Math.max(1, bounds.height)
  );
}

async function refreshCrossOriginBlueBgImages() {
  const reloadIfRemote = async (image, source) => {
    const resolvedSource = source || image?.currentSrc || image?.src;
    if (!isCrossOriginImageSource(resolvedSource)) return image;
    return loadImageSource(resolvedSource);
  };
  for (const layer of blueBgState.layers) {
    const material = Number.isInteger(layer.materialIndex) ? bgMaterials[layer.materialIndex] : null;
    layer.image = await reloadIfRemote(layer.image, material?.previewUrl || layer.image?.currentSrc || layer.image?.src);
  }
  blueBgState.backgroundImage = await reloadIfRemote(
    blueBgState.backgroundImage,
    blueBgState.backgroundImageUrl || blueBgState.backgroundImage?.currentSrc || blueBgState.backgroundImage?.src
  );
  blueBgState.headerImage = await reloadIfRemote(blueBgState.headerImage);
  blueBgState.footerImage = await reloadIfRemote(blueBgState.footerImage);
  blueBgState.background = blueBgState.backgroundImage;
  renderBlueBgCanvas();
}

function blueBgExportImageSources() {
  const sources = blueBgState.layers.map(layer => ({
    label: `前景图“${layer.fileName || "未命名图片"}”`,
    image: layer.image,
  }));
  if (["image", "wallpaper"].includes(blueBgState.backgroundType)) {
    sources.push({
      label: `背景图“${blueBgState.backgroundImageName || "未命名图片"}”`,
      image: blueBgState.backgroundImage,
    });
  }
  if (blueBgState.backgroundType === "lizhi") {
    sources.push({ label: "荔枝背景页眉", image: blueBgState.headerImage });
    sources.push({ label: "荔枝背景页脚", image: blueBgState.footerImage });
  }
  return sources.filter(source => source.image);
}

function assertBlueBgExportSourcesReadable() {
  if (window.location.protocol === "file:") {
    throw new Error("当前是直接打开的 file:// 页面。请用本地静态服务器打开项目，再导出。\n例如：python3 -m http.server 8080，然后访问 http://127.0.0.1:8080/");
  }
  const unreadable = [];
  for (const source of blueBgExportImageSources()) {
    const probe = document.createElement("canvas");
    probe.width = 1;
    probe.height = 1;
    try {
      const ctx = probe.getContext("2d", { willReadFrequently: true });
      ctx.drawImage(source.image, 0, 0, 1, 1);
      ctx.getImageData(0, 0, 1, 1);
    } catch (error) {
      unreadable.push(source.label);
    }
  }
  if (unreadable.length) {
    throw new Error(`以下图片不允许浏览器读取像素，不能导出：${unreadable.join("、")}。请下载后通过“导入图片”重新加入。`);
  }
  // 模糊标注会读取当前工作画布。即使原图地址已经不可追溯，
  // 这里也能在真正合成前发现已经被污染的工作画布。
  try {
    const canvas = blueBgCanvas();
    canvas.getContext("2d", { willReadFrequently: true }).getImageData(0, 0, 1, 1);
  } catch (error) {
    throw new Error("当前工作画布含有无法读取的旧图片数据。请重新导入该图片，或新建画布后再次导出。");
  }
}

function canvasToPngBlob(canvas) {
  return new Promise((resolve, reject) => {
    try {
      canvas.toBlob(blob => {
        if (blob) resolve(blob);
        else reject(new Error("浏览器未能生成 PNG 文件。"));
      }, "image/png");
    } catch (error) {
      reject(error);
    }
  });
}

function composeTransparentBlueBgOutputCanvas() {
  const bounds = blueBgTransparentExportBounds();
  if (!bounds) return document.createElement("canvas");
  const scale = blueBgTransparentExportScale(bounds);
  const output = document.createElement("canvas");
  output.width = Math.max(1, Math.round(bounds.width * scale));
  output.height = Math.max(1, Math.round(bounds.height * scale));
  const ctx = output.getContext("2d");
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  ctx.scale(scale, scale);
  ctx.translate(-bounds.x, -bounds.y);
  blueBgState.layers.forEach(layer => drawBlueBgLayer(ctx, layer));
  syncBgAnnotationSource(blueBgCanvas());
  withAnnotationState(bgAnnotationState, () => {
    bgAnnotationState.items.forEach(item => drawAnnotationItem(ctx, item, false));
  });
  return output;
}

function composeBlueBgOutputCanvas() {
  if (blueBgState.backgroundType === "transparent") {
    return composeTransparentBlueBgOutputCanvas();
  }
  const output = document.createElement("canvas");
  renderBlueBgCanvas(true, output);
  return output;
}

async function confirmBlueBgRender() {
  if (!blueBgState.layers.length) {
    blueBgStatus("请至少添加一张图片。");
    return;
  }
  try {
    await refreshCrossOriginBlueBgImages();
    assertBlueBgExportSourcesReadable();
    const output = composeBlueBgOutputCanvas();
    const blob = await canvasToPngBlob(output);
    const filename = blueBgFilename();
    bgGeneratedResults = [{ blob, filename }];
    downloadBlob(blob, filename);
    updateBgExportState();
    blueBgStatus(`已导出 ${output.width} × ${output.height}px 图片。`);
  } catch (error) {
    blueBgStatus(`导出失败：${error.message || "请重试。"}`);
  }
}

async function sendBgToAnnotation() {
  if (!blueBgState.layers.length) return;
  try {
    await refreshCrossOriginBlueBgImages();
    assertBlueBgExportSourcesReadable();
    const blob = await canvasToPngBlob(composeBlueBgOutputCanvas());
    const baseName = (blueBgState.sourceName || "image").replace(/\.[^.]+$/, "");
    const file = new File([blob], `${baseName}-小编盒子.png`, { type: "image/png" });
    showTab("annotation");
    loadAnnotationImage(file);
  } catch (error) {
    blueBgStatus(`发送失败：${error.message || "请重试。"}`);
  }
}

function toggleBlueBgMode() {
  $("#bgBlueMode").checked = true;
  $("#bgPreview").hidden = true;
  $("#blueBgEditor").hidden = !blueBgState.canvasWidth;
  renderBgMaterialList();
  syncBgEffectToolbar();
  updateBgExportState();
}

function setBgMode(blueprint) {
  $("#bgBlueMode").checked = true;
  toggleBlueBgMode();
}

function clearBgMaterials() {
  bgMaterials.forEach(material => {
    if (material.previewUrl) URL.revokeObjectURL(material.previewUrl);
    if (material.outputUrl) URL.revokeObjectURL(material.outputUrl);
    if (material.renderTimer) window.clearTimeout(material.renderTimer);
    bgRenderControllers.get(material)?.abort();
  });
  bgMaterials = [];
  bgSelectedMaterialIndex = -1;
  bgSelectedMaterialIndices = [];
  bgContextMaterialIndex = -1;
  bgMaterialStackSequence = 0;
}

function setBgFiles(fileList) {
  const files = Array.from(fileList || []);
  clearBgMaterials();
  bgMaterials = files.map((file, index) => ({
    file,
    stackOrder: index + 1,
    previewUrl: URL.createObjectURL(file),
    scale: 90,
    shadow: true,
    round: true,
    unused: false,
    cornerRadius: SYSTEM_CORNER_RADIUS,
    cornerAuto: true,
    corners: "1111",
    outputBlob: null,
    outputUrl: "",
    outputLabel: "",
    filename: "",
    renderVersion: 0,
    rendering: false,
    renderTimer: null,
  }));
  bgMaterialStackSequence = bgMaterials.length + 1;
  bgSelectedMaterialIndex = bgMaterials.length ? 0 : -1;
  bgSelectedMaterialIndices = [];
  bgGeneratedResults = [];
  blueBgState.layers = [];
  blueBgState.selectedId = null;
  blueBgState.selectedIds = [];
  bgAnnotationState.items = [];
  bgAnnotationState.selectedId = null;
  bgAnnotationState.selectedIds = [];
  bgAnnotationState.selectedPart = null;
  bgAnnotationState.nextId = 1;
  bgAnnotationState.nextNumber = 1;
  resetBgHistory();
  renderBgMaterialList();
  renderBgPreviewList();
  updateBgExportState();
  if ($("#bgBlueMode").checked && files.length) {
    startBlueBgPreview(files).catch(err => alert(err.message));
  } else if (bgMaterials.length) {
    openBgMaterialInspector(0);
    processBgImages().catch(err => alert(err.message));
  }
}

async function importBgFiles(fileList) {
  const files = Array.from(fileList || []);
  if (!files.length) return;
  if ($("#bgBlueMode").checked) {
    // 蓝底统一画布模式：素材库全局共享，导入的图片只加入当前标签页画布，
    // 绝不整体重置素材库或其他标签页。
    if (!currentBgTab()) createBgTab();
    const available = BLUE_BG_MAX_LAYERS - blueBgState.layers.length;
    const accepted = files.slice(0, Math.max(0, available));
    bgMaterials.push(...files.map(file => ({
      file,
      stackOrder: bgMaterialStackSequence++,
      previewUrl: URL.createObjectURL(file),
      scale: 90,
      shadow: true,
      round: true,
      unused: !accepted.includes(file),
      cornerRadius: SYSTEM_CORNER_RADIUS,
      cornerAuto: true,
      corners: "1111",
      outputBlob: null,
      outputUrl: "",
      outputLabel: "",
      filename: "",
      renderVersion: 0,
      rendering: false,
      renderTimer: null,
    })));
    await ensureUnifiedBgBackground(blueBgState.layers[0]?.image || null);
    if (accepted.length) {
      await addBlueBgFiles(accepted);
    } else {
      blueBgStatus(
        `当前画布最多支持 ${BLUE_BG_MAX_LAYERS} 张图片，新导入的 ${files.length} 张已存入素材库。`
      );
    }
    renderBgMaterialList();
    updateBgExportState();
    return;
  }
  setBgFiles(files);
}

function clipboardImageFiles(event) {
  const items = Array.from(event.clipboardData?.items || []);
  return items
    .filter(item => item.kind === "file" && item.type.startsWith("image/"))
    .map((item, index) => item.getAsFile?.())
    .filter(Boolean)
    .map((file, index) => {
      if (file.name) return file;
      const extension = file.type.split("/")[1]?.replace("jpeg", "jpg") || "png";
      return new File([file], `粘贴图片-${Date.now()}-${index + 1}.${extension}`, { type: file.type });
    });
}

async function importClipboardImageIntoActiveModule(event) {
  const moduleId = activeImageModuleId();
  if (!moduleId) return false;
  const target = event.target;
  if (target?.matches?.(
    'textarea, select, [contenteditable="true"], input:not([type="file"]):not([type="button"]):not([type="checkbox"])'
  )) return false;
  const files = clipboardImageFiles(event);
  if (!files.length) return false;
  event.preventDefault();
  try {
    if (moduleId === "bg") {
      if ($("#bgBlueMode").checked) {
        await importBgFiles(files);
      } else if (bgMaterials.length) {
        setBgFiles([...bgMaterials.map(material => material.file), ...files]);
      } else {
        setBgFiles(files);
      }
      return true;
    }
    if (moduleId === "annotation") {
      loadAnnotationImage(files[0]);
      return true;
    }
    if (moduleId === "imageEditor") {
      // 换屏模式下粘贴的是「要贴上去的截图」，直接贴到已定的选区内；
      // 不能走 loadImageEditorFile，那会把底图和四角一起清掉。
      if (imageEditorState.mode === "screen" && imageEditorState.hasImage) {
        await imageEditorScreenLoadFile(files[0]);
      } else {
        await loadImageEditorFile(files[0]);
      }
      return true;
    }
  } catch (error) {
    const message = error?.message || "剪贴板图片导入失败，请重试。";
    if (moduleId === "bg") {
      if ($("#bgBlueMode").checked) blueBgStatus(message);
    } else if (moduleId === "annotation") {
      annotationStatusText(message);
    } else {
      imageEditorStatus(message);
    }
  }
  return false;
}

function openBgMaterialInspector(index) {
  const material = bgMaterials[index];
  if (!material || $("#bgBlueMode").checked) return;
  if (material.unused) {
    material.unused = false;
    material.outputBlob = null;
    scheduleDefaultBgMaterialRender(index);
  }
  bgSelectedMaterialIndex = index;
  bgSelectedMaterialIndices = [];
  syncBgEffectToolbar();
  renderBgMaterialList();
  renderBgPreviewList();
  updateBgExportState();
}

function toggleDefaultBgMaterialSelection(index) {
  if ($("#bgBlueMode").checked || index < 0 || index >= bgMaterials.length) return;
  const ids = new Set(selectedDefaultBgMaterialIndexes());
  if (bgMaterials[index].unused) {
    bgMaterials[index].unused = false;
    bgMaterials[index].outputBlob = null;
    scheduleDefaultBgMaterialRender(index);
  }
  const adding = !ids.has(index);
  if (adding) ids.add(index);
  else ids.delete(index);
  bgSelectedMaterialIndices = [...ids].sort((a, b) => a - b);
  bgSelectedMaterialIndex = adding ? index : (bgSelectedMaterialIndices.at(-1) ?? -1);
  renderBgMaterialList();
  renderBgPreviewList();
  syncBgEffectToolbar();
  updateBgExportState();
}

function saveBgMaterialInspector() {
  const indexes = selectedDefaultBgMaterialIndexes();
  if (!indexes.length || $("#bgBlueMode").checked) return;
  const scale = Math.max(40, Math.min(500, Number($("#bgEffectScale").value) || 90));
  indexes.forEach(index => {
    const material = bgMaterials[index];
    material.scale = scale;
    material.shadow = $("#bgEffectShadow").checked;
    material.round = $("#bgEffectRound").checked;
    material.outputBlob = null;
    scheduleDefaultBgMaterialRender(index);
  });
  $("#bgEffectScaleValue").textContent = `${scale}%`;
  syncBgEffectToolbar();
  syncBgGeneratedResults();
}

function saveBgMaterialCornerRadius() {
  const indexes = selectedDefaultBgMaterialIndexes();
  if (!indexes.length || $("#bgBlueMode").checked) return;
  const radius = Math.max(0, Math.min(128, Number($("#bgEffectRoundRadius").value) || 0));
  indexes.forEach(index => {
    const material = bgMaterials[index];
    material.cornerRadius = radius;
    material.cornerAuto = false;
    material.outputBlob = null;
    scheduleDefaultBgMaterialRender(index);
  });
  $("#bgEffectRoundRadiusValue").textContent = `${radius} px`;
  syncBgEffectToolbar();
  syncBgGeneratedResults();
}

function renderBgMaterialList() {
  const wrap = $("#bgMaterialList");
  if (!wrap) return;
  $("#bgPreview").hidden = true;
  const scroller = wrap.closest(".bg-material-pane");
  const scrollTop = scroller?.scrollTop || 0;
  wrap.innerHTML = "";
  const displayIndexes = orderedBgMaterialIndexes();
  displayIndexes.forEach(index => {
    const material = bgMaterials[index];
    const layer = blueBgState.layers.find(item => item.materialIndex === index);
    const selected = layer && selectedBlueBgLayers().some(item => item.id === layer.id);
    const card = document.createElement("div");
    card.className = `bg-material-card${selected ? " active" : ""}${material.unused ? " is-unused" : ""}`;
    card.dataset.bgMaterialIndex = String(index);
    if (layer) {
      card.dataset.bgLayerId = String(layer.id);
    }
    card.tabIndex = 0;
    card.setAttribute("role", "button");
    card.setAttribute("aria-label", `选择素材 ${material.file.name}${material.unused ? "（未使用）" : ""}`);
    const preview = document.createElement("div");
    preview.className = "bg-material-preview";
    const img = document.createElement("img");
    img.src = material.previewUrl;
    img.alt = "";
    img.draggable = false;
    preview.appendChild(img);
    card.appendChild(preview);
    if (material.unused) {
      const badge = document.createElement("span");
      badge.className = "bg-material-unused-badge";
      badge.textContent = "未使用";
      card.appendChild(badge);
    }
    wrap.appendChild(card);
  });
  const importButton = $("#bgImportButton");
  importButton.disabled = blueBgState.layers.length >= BLUE_BG_MAX_LAYERS;
  importButton.title = importButton.disabled
    ? `最多可导入 ${BLUE_BG_MAX_LAYERS} 张图片`
    : "导入图片 (I / Ctrl/⌘ V)";
  if (scroller) scroller.scrollTop = scrollTop;
}

function deleteDefaultBgMaterial(index) {
  if ($("#bgBlueMode").checked || index < 0 || index >= bgMaterials.length) return;
  bgMaterials.splice(index, 1);
  if (!bgMaterials.length) bgSelectedMaterialIndex = -1;
  else if (bgSelectedMaterialIndex >= bgMaterials.length) bgSelectedMaterialIndex = bgMaterials.length - 1;
  else if (index < bgSelectedMaterialIndex) bgSelectedMaterialIndex--;
  renderBgMaterialList();
  renderBgPreviewList();
  syncBgGeneratedResults();
  syncBgEffectToolbar();
  pushBgHistory();
}

function deleteSelectedDefaultBgMaterials() {
  const indexes = selectedDefaultBgMaterialIndexes().sort((a, b) => b - a);
  if (!indexes.length) return;
  indexes.forEach(index => bgMaterials.splice(index, 1));
  bgSelectedMaterialIndices = [];
  bgSelectedMaterialIndex = bgMaterials.length ? Math.min(indexes.at(-1), bgMaterials.length - 1) : -1;
  renderBgMaterialList();
  renderBgPreviewList();
  syncBgGeneratedResults();
  syncBgEffectToolbar();
  pushBgHistory();
}

function deleteSelectedBgItem() {
  if ($("#bgBlueMode").checked) deleteSelectedBgCanvasItems();
  else deleteSelectedDefaultBgMaterials();
}

function scrollToDefaultBgPreview(index) {
  const scroller = $(".bg-preview");
  const preview = $(`[data-bg-preview-index="${index}"]`, scroller);
  if (!scroller || !preview) return;
  const scrollerRect = scroller.getBoundingClientRect();
  const previewRect = preview.getBoundingClientRect();
  const paddingTop = Number.parseFloat(getComputedStyle(scroller).paddingTop) || 0;
  const targetTop = scroller.scrollTop + previewRect.top - scrollerRect.top - scroller.clientTop - paddingTop;
  scroller.scrollTo({
    top: Math.max(0, Math.min(targetTop, scroller.scrollHeight - scroller.clientHeight)),
    behavior: "smooth",
  });
}

function batchDownloadBgResults() {
  bgGeneratedResults.forEach(({ blob, filename }, index) => {
    window.setTimeout(() => downloadBlob(blob, filename), index * 120);
  });
}

function updateBgExportState() {
  $("#bgExportButton").disabled = !blueBgState.layers.length;
  $("#bgUndo").disabled = bgHistoryIndex <= 0;
  $("#bgRedo").disabled = bgHistoryIndex < 0 || bgHistoryIndex >= bgHistory.length - 1;
}

function captureBgHistoryState() {
  return {
    materials: bgMaterials.map(material => ({ ...material, renderTimer: null })),
    layers: blueBgState.layers.map(layer => ({ ...layer })),
    background: {
      type: blueBgState.backgroundType,
      color: blueBgState.backgroundColor,
      gradient: blueBgState.backgroundGradient,
      imageUrl: blueBgState.backgroundImageUrl,
      imageName: blueBgState.backgroundImageName,
      aspectMode: blueBgState.aspectMode,
      defaultAspect: blueBgState.defaultAspect,
    },
    selectedId: blueBgState.selectedId,
    selectedIds: [...blueBgState.selectedIds],
    selectedMaterialIndex: bgSelectedMaterialIndex,
    selectedMaterialIndices: [...bgSelectedMaterialIndices],
    annotations: {
      items: bgAnnotationState.items.map(item => ({ ...item })),
      nextId: bgAnnotationState.nextId,
      nextNumber: bgAnnotationState.nextNumber,
      numberSize: bgAnnotationState.numberSize,
      numberColor: bgAnnotationState.numberColor,
      blurStrength: bgAnnotationState.blurStrength,
      maskColor: bgAnnotationState.maskColor,
      maskRound: bgAnnotationState.maskRound,
      maskRoundRadius: bgAnnotationState.maskRoundRadius,
      magnifierColor: bgAnnotationState.magnifierColor,
      magnifierWidth: bgAnnotationState.magnifierWidth,
      shadows: { ...bgAnnotationState.shadows },
    },
  };
}

function pushBgHistory() {
  const snapshot = captureBgHistoryState();
  const signature = JSON.stringify({
    materials: snapshot.materials.map(material => ({
      name: material.file?.name,
      stackOrder: material.stackOrder,
      scale: material.scale,
      shadow: material.shadow,
      round: material.round,
      cornerRadius: material.cornerRadius,
      cornerAuto: material.cornerAuto,
      corners: bgCornersFromFlags(bgCornerFlags(material.corners)),
      unused: material.unused,
    })),
    layers: snapshot.layers.map(layer => ({
      id: layer.id, materialIndex: layer.materialIndex, x: layer.x, y: layer.y, width: layer.width, height: layer.height,
      shadow: layer.shadow, round: layer.round,
      cornerRadius: layer.cornerRadius,
      cornerAuto: layer.cornerAuto,
      corners: bgCornersFromFlags(bgCornerFlags(layer.corners)),
      unused: layer.unused,
    })),
    selectedId: snapshot.selectedId,
    selectedIds: snapshot.selectedIds,
    selectedMaterialIndex: snapshot.selectedMaterialIndex,
    selectedMaterialIndices: snapshot.selectedMaterialIndices,
    background: snapshot.background,
    annotations: snapshot.annotations,
  });
  if (bgHistory[bgHistoryIndex]?.signature === signature) return;
  bgHistory = bgHistory.slice(0, bgHistoryIndex + 1);
  bgHistory.push({ snapshot, signature });
  if (bgHistory.length > 40) bgHistory.shift();
  bgHistoryIndex = bgHistory.length - 1;
  updateBgExportState();
}

function resetBgHistory() {
  bgHistory = [];
  bgHistoryIndex = -1;
  pushBgHistory();
}

function restoreBgHistory(index) {
  const entry = bgHistory[index];
  if (!entry) return;
  bgMaterials.forEach(material => {
    if (material.renderTimer) window.clearTimeout(material.renderTimer);
    bgRenderControllers.get(material)?.abort();
  });
  bgHistoryIndex = index;
  bgMaterials = entry.snapshot.materials.map(material => ({ ...material, renderTimer: null }));
  bgMaterialStackSequence = Math.max(0, ...bgMaterials.map(material => Number(material.stackOrder) || 0)) + 1;
  bgContextMaterialIndex = -1;
  bgSelectedMaterialIndex = Math.min(entry.snapshot.selectedMaterialIndex ?? bgSelectedMaterialIndex, bgMaterials.length - 1);
  bgSelectedMaterialIndices = (entry.snapshot.selectedMaterialIndices || []).filter(index => index < bgMaterials.length);
  blueBgState.layers = entry.snapshot.layers.map(layer => ({ ...layer }));
  blueBgState.selectedId = entry.snapshot.selectedId;
  blueBgState.selectedIds = (entry.snapshot.selectedIds || []).filter(id => blueBgState.layers.some(layer => layer.id === id));
  const annotations = entry.snapshot.annotations || {};
  bgAnnotationState.items = (annotations.items || []).map(item => ({ ...item }));
  bgAnnotationState.nextId = annotations.nextId || Math.max(0, ...bgAnnotationState.items.map(item => item.id)) + 1;
  bgAnnotationState.nextNumber = annotations.nextNumber || Math.max(
    0, ...bgAnnotationState.items.filter(item => item.type === "number").map(item => item.number)
  ) + 1;
  bgAnnotationState.numberSize = annotations.numberSize || ANNOTATION_NUMBER_SIZE;
  bgAnnotationState.numberColor = annotations.numberColor || "#ff5a52";
  bgAnnotationState.blurStrength = annotations.blurStrength || 6;
  bgAnnotationState.maskColor = annotations.maskColor || "#98b2c0";
  bgAnnotationState.maskRound = Boolean(annotations.maskRound);
  bgAnnotationState.maskRoundRadius = annotations.maskRoundRadius || 16;
  bgAnnotationState.magnifierColor = annotations.magnifierColor || ANNOTATION_MAGNIFIER_COLOR;
  bgAnnotationState.magnifierWidth = annotations.magnifierWidth || ANNOTATION_MAGNIFIER_LINE_WIDTH;
  bgAnnotationState.shadows = {
    number: false,
    mask: false,
    blur: false,
    magnifier: false,
    ...(annotations.shadows || {}),
  };
  clearBgAnnotationSelection();
  if (entry.snapshot.background) {
    const background = entry.snapshot.background;
    blueBgState.backgroundType = background.type || "lizhi";
    blueBgState.backgroundColor = background.color || BG_DEFAULT_COLOR;
    blueBgState.backgroundGradient = background.gradient || BG_GRADIENT_PRESETS[0].id;
    blueBgState.backgroundImageUrl = background.imageUrl || "";
    blueBgState.backgroundImageName = background.imageName || "";
    blueBgState.backgroundImage = null;
    blueBgState.aspectMode = background.aspectMode || "default";
    blueBgState.defaultAspect = background.defaultAspect || blueBgState.defaultAspect;
  }
  renderBgMaterialList();
  if ($("#bgBlueMode").checked) {
    ensureUnifiedBgBackground(blueBgState.layers[0]?.image || null).then(() => {
      updateBlueBgControls();
      renderBlueBgCanvas();
      // 撤销只回放编辑内容：缩放与画面位置属于视图操作，保持用户当前的视野。
      resetBlueBgZoom(blueBgState.zoom, { preserveView: true });
    }).catch(err => blueBgStatus(err.message));
  } else {
    if (bgSelectedMaterialIndex >= 0) openBgMaterialInspector(bgSelectedMaterialIndex);
    processBgImages().catch(err => alert(err.message));
  }
  updateBgExportState();
}

function renderBgPreviewList() {
  const wrap = $("#bgPreview");
  if (!wrap || $("#bgBlueMode").checked) return;
  const scroller = wrap;
  const scrollTop = scroller?.scrollTop || 0;
  wrap.innerHTML = "";
  wrap.classList.toggle("is-empty", bgMaterials.length === 0);
  bgMaterials.forEach((material, index) => {
    const card = document.createElement("button");
    card.type = "button";
    card.className = `bg-preview-card${selectedDefaultBgMaterialIndexes().includes(index) ? " active" : ""}${material.unused ? " is-unused" : ""}`;
    card.dataset.bgPreviewIndex = String(index);
    if (material.outputUrl) {
      const img = document.createElement("img");
      img.src = material.outputUrl;
      img.alt = `${material.file.name} 预览`;
      card.appendChild(img);
    } else {
      const placeholder = document.createElement("span");
      placeholder.className = "preview-placeholder";
      placeholder.textContent = material.rendering ? "正在生成预览…" : "等待生成预览";
      card.appendChild(placeholder);
    }
    const label = document.createElement("small");
    label.textContent = material.outputLabel || material.file.name;
    card.appendChild(label);
    if (material.unused) {
      const badge = document.createElement("span");
      badge.className = "bg-material-unused-badge";
      badge.textContent = "未使用";
      card.appendChild(badge);
    }
    wrap.appendChild(card);
  });
  if (!wrap.children.length) {
    wrap.innerHTML = '<div class="bg-preview-empty-state">暂无预览</div>';
  }
  if (scroller) scroller.scrollTop = scrollTop;
}

function syncBgGeneratedResults() {
  bgGeneratedResults = bgMaterials
    .filter(material => material.outputBlob)
    .map(material => ({ blob: material.outputBlob, filename: material.filename }));
  updateBgExportState();
}

function refreshDefaultBgPreviewCard(index) {
  const material = bgMaterials[index];
  const card = $(`[data-bg-preview-index="${index}"]`, $("#bgPreview"));
  if (!material || !card) {
    renderBgPreviewList();
    return;
  }
  let visual = $("img, .preview-placeholder", card);
  if (material.outputUrl) {
    if (!visual?.matches("img")) {
      const img = document.createElement("img");
      visual?.replaceWith(img);
      if (!visual) card.prepend(img);
      visual = img;
    }
    visual.src = material.outputUrl;
    visual.alt = `${material.file.name} 预览`;
  } else {
    if (!visual?.matches(".preview-placeholder")) {
      const placeholder = document.createElement("span");
      placeholder.className = "preview-placeholder";
      visual?.replaceWith(placeholder);
      if (!visual) card.prepend(placeholder);
      visual = placeholder;
    }
    visual.textContent = material.rendering ? "正在生成预览…" : "等待生成预览";
  }
  let label = $("small", card);
  if (!label) {
    label = document.createElement("small");
    card.appendChild(label);
  }
  label.textContent = material.outputLabel || material.file.name;
}

async function renderDefaultBgMaterial(index, scheduledVersion = null) {
  const material = bgMaterials[index];
  if (!material || $("#bgBlueMode").checked) return;
  const version = scheduledVersion ?? ++material.renderVersion;
  if (version !== material.renderVersion) return;
  bgRenderControllers.get(material)?.abort();
  const controller = new AbortController();
  bgRenderControllers.set(material, controller);
  material.rendering = true;
  if (!material.outputUrl) refreshDefaultBgPreviewCard(index);
  try {
    const { file, scale, shadow, round } = material;
    const form = new FormData();
    form.append("image", file);
    form.append("scale", scale);
    form.append("shadow", shadow ? "1" : "0");
    form.append("round", round ? "1" : "0");
    form.append("cornerMode", material.cornerAuto === false ? "manual" : "auto");
    if (material.cornerAuto === false) form.append("cornerRadius", material.cornerRadius);
    const res = await fetch("/api/render-bg", {
      method: "POST",
      body: form,
      signal: controller.signal,
    });
    if (!res.ok) throw new Error(await res.text());
    const mode = res.headers.get("X-Lizhi-Bg-Mode") || "manual";
    const appliedShadow = res.headers.get("X-Lizhi-Bg-Shadow") === "1";
    const appliedRound = res.headers.get("X-Lizhi-Bg-Round") === "1";
    const blob = await res.blob();
    if (version !== material.renderVersion) return;
    const previousOutputUrl = material.outputUrl;
    material.outputBlob = blob;
    material.outputUrl = URL.createObjectURL(blob);
    const baseName = file.name.replace(/\.[^.]+$/, "");
    material.filename = `${baseName}-bg-auto.png`;
    material.outputLabel = `${file.name} · ${bgModeLabel(mode, appliedShadow, appliedRound)}`;
    if (previousOutputUrl) {
      window.setTimeout(() => URL.revokeObjectURL(previousOutputUrl), 1000);
    }
  } catch (error) {
    if (error.name !== "AbortError") throw error;
  } finally {
    if (bgRenderControllers.get(material) === controller) {
      bgRenderControllers.delete(material);
    }
    if (version === material.renderVersion) {
      material.rendering = false;
      refreshDefaultBgPreviewCard(index);
      syncBgGeneratedResults();
    }
  }
}

function scheduleDefaultBgMaterialRender(index) {
  const material = bgMaterials[index];
  if (!material || $("#bgBlueMode").checked) return;
  if (material.renderTimer) window.clearTimeout(material.renderTimer);
  bgRenderControllers.get(material)?.abort();
  const version = ++material.renderVersion;
  material.renderTimer = window.setTimeout(() => {
    material.renderTimer = null;
    renderDefaultBgMaterial(index, version).catch(err => alert(err.message));
  }, 180);
}

async function processBgImages() {
  if ($("#bgBlueMode").checked) return;
  await Promise.all(bgMaterials.map((_, index) => renderDefaultBgMaterial(index)));
}

function bgModeLabel(mode, withShadow, withRound) {
  const shadowText = withShadow ? "带阴影" : "无阴影";
  const roundText = withRound ? "带圆角" : "无圆角";
  return { "white-edge": `白边截图，${shadowText}，${roundText}`, transparent: `透明底，${shadowText}，${roundText}`, manual: `手动加底，${shadowText}，${roundText}` }[mode] || mode;
}

function imageEditorCanvas() {
  return $("#imageEditorCanvas");
}

function imageEditorStatus(message) {
  $("#imageEditorStatus").textContent = message;
}

function cloneCanvas(source) {
  const clone = document.createElement("canvas");
  clone.width = source.width;
  clone.height = source.height;
  clone.getContext("2d").drawImage(source, 0, 0);
  return clone;
}

function canvasScaledToWidth(source, targetWidth = IMAGE_EXPORT_WIDTH) {
  if (source.width === targetWidth) return source;
  const output = document.createElement("canvas");
  output.width = targetWidth;
  output.height = Math.max(1, Math.round(source.height * targetWidth / source.width));
  const ctx = output.getContext("2d");
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(source, 0, 0, output.width, output.height);
  return output;
}

function pushImageEditorHistory() {
  imageEditorState.history = imageEditorState.history.slice(0, imageEditorState.historyIndex + 1);
  imageEditorState.history.push(cloneCanvas(imageEditorState.documentCanvas));
  if (imageEditorState.history.length > 6) imageEditorState.history.shift();
  imageEditorState.historyIndex = imageEditorState.history.length - 1;
}

function updateImageEditorControls() {
  const hasImage = imageEditorState.hasImage;
  const hasSelection = Boolean(imageEditorState.selection);
  [
    "#imageEditorMoveMode",
    "#imageEditorRemoveMode",
    "#imageEditorInpaintMode",
    "#imageEditorCoverMode",
    "#imageEditorCropMode",
    "#imageEditorGradientMode",
    "#imageEditorMoreButton",
    "#imageEditorSplitMode",
    "#imageEditorBlendMode",
    "#imageEditorWindowMode",
    "#imageEditorScreenMode",
    "#imageEditorExport",
  ].forEach(selector => {
    $(selector).disabled = !hasImage;
  });
  const screenHistoryActive = imageEditorState.mode === "screen";
  const screenState = imageEditorScreen();
  $("#imageEditorUndo").disabled = !hasImage || (screenHistoryActive
    ? screenState.editHistoryIndex <= 0
    : imageEditorState.historyIndex <= 0);
  $("#imageEditorRedo").disabled = !hasImage || (screenHistoryActive
    ? screenState.editHistoryIndex >= screenState.editHistory.length - 1
    : imageEditorState.historyIndex >= imageEditorState.history.length - 1);
  $("#imageEditorMoveMode").classList.toggle("active", imageEditorState.mode === "view");
  $("#imageEditorRemoveMode").classList.toggle("active", imageEditorState.mode === "remove");
  $("#imageEditorInpaintMode").classList.toggle("active", imageEditorState.mode === "inpaint");
  $("#imageEditorCoverMode").classList.toggle("active", imageEditorState.mode === "cover");
  $("#imageEditorCropMode").classList.toggle("active", imageEditorState.mode === "crop");
  $("#imageEditorGradientMode").classList.toggle("active", imageEditorState.mode === "gradient");
  $("#imageEditorSplitMode").classList.toggle("active", imageEditorState.mode === "split");
  $("#imageEditorBlendMode").classList.toggle("active", imageEditorState.mode === "blend");
  $("#imageEditorMoreButton").classList.toggle("active", ["split", "blend"].includes(imageEditorState.mode));
  $("#imageEditorScreenMode").classList.toggle("active", imageEditorState.mode === "screen");
  const compositeActive = ["split", "blend"].includes(imageEditorState.mode);
  const inpaintActive = imageEditorState.mode === "inpaint";
  const coverActive = imageEditorState.mode === "cover";
  const screenActive = imageEditorState.mode === "screen";
  const inspector = $("#imageEditorInspector");
  $("#imageEditorCompositeControls").hidden = !compositeActive;
  $("#imageEditorInpaintControls").hidden = !inpaintActive;
  $("#imageEditorCoverControls").hidden = !coverActive;
  $("#imageEditorScreenControls").hidden = !screenActive;
  $("#imageEditorInspectorHint").hidden = compositeActive || inpaintActive || coverActive || screenActive;
  inspector.classList.toggle("is-disabled", !compositeActive && !inpaintActive && !coverActive && !screenActive);
  $("#imageEditorScreenFileButton").disabled = !hasImage;
  $("#imageEditorScreenReset").disabled = !hasImage || !screenState.corners.length;
  $("#imageEditorScreenRefine").disabled = !hasImage || screenState.corners.length !== 4;
  if (screenActive) imageEditorScreenSyncParamLabels();
  $$("#imageEditorCoverControls [data-cover-shape]").forEach(button => {
    button.classList.toggle("active", button.dataset.coverShape === imageEditorState.coverShape);
  });
  $("#imageEditorBlendWidthField").hidden = imageEditorState.mode !== "blend";
  $("#imageEditorApplyComposite").disabled = !imageEditorState.secondImage;
  $("#imageEditorCanvasZoom").disabled = !hasImage;
  const stage = $("#imageEditorStage");
  stage.dataset.mode = imageEditorState.mode;
  stage.classList.toggle("has-selection", hasSelection || Boolean(imageEditorState.gradient));
  syncImageEditorOverlays();
  scheduleImageEditorInspectorAlign();
}

function intersectImageEditorSelection(selection = imageEditorState.selection) {
  if (!selection) return null;
  const source = imageEditorState.documentCanvas;
  const bounds = imageEditorSelectionVisualBounds(selection);
  const left = Math.max(0, bounds.x);
  const top = Math.max(0, bounds.y);
  const right = Math.min(source.width, bounds.x + bounds.width);
  const bottom = Math.min(source.height, bounds.y + bounds.height);
  if (right <= left || bottom <= top) return null;
  return { x: left, y: top, width: right - left, height: bottom - top };
}

function imageEditorRemovalIsHorizontal(selection = imageEditorState.selection) {
  if (!selection) return true;
  const source = imageEditorState.documentCanvas;
  return selection.width / Math.max(1, source.width) >=
    selection.height / Math.max(1, source.height);
}

function imageEditorSelectionVisualBounds(selection) {
  const skew = Number(selection?.skew) || 0;
  if (!selection || !skew) return selection ? { ...selection } : null;
  if (imageEditorRemovalIsHorizontal(selection)) {
    return {
      x: selection.x,
      y: selection.y + Math.min(0, skew),
      width: selection.width,
      height: selection.height + Math.abs(skew),
    };
  }
  return {
    x: selection.x + Math.min(0, skew),
    y: selection.y,
    width: selection.width + Math.abs(skew),
    height: selection.height,
  };
}

function imageEditorSelectionPolygon(selection) {
  const skew = Number(selection?.skew) || 0;
  const x = selection.x;
  const y = selection.y;
  const right = x + selection.width;
  const bottom = y + selection.height;
  return imageEditorRemovalIsHorizontal(selection)
    ? [
        { x, y },
        { x: right, y: y + skew },
        { x: right, y: bottom + skew },
        { x, y: bottom },
      ]
    : [
        { x, y },
        { x: right, y },
        { x: right + skew, y: bottom },
        { x: x + skew, y: bottom },
      ];
}

function pointInImageEditorSelection(selection, point) {
  const polygon = imageEditorState.mode === "remove"
    ? imageEditorSelectionPolygon(selection)
    : [
        { x: selection.x, y: selection.y },
        { x: selection.x + selection.width, y: selection.y },
        { x: selection.x + selection.width, y: selection.y + selection.height },
        { x: selection.x, y: selection.y + selection.height },
      ];
  let inside = false;
  for (let index = 0, previous = polygon.length - 1; index < polygon.length; previous = index++) {
    const a = polygon[index];
    const b = polygon[previous];
    const crosses = (a.y > point.y) !== (b.y > point.y) &&
      point.x < (b.x - a.x) * (point.y - a.y) / (b.y - a.y || Number.EPSILON) + a.x;
    if (crosses) inside = !inside;
  }
  return inside;
}

function drawImageEditorSelection(ctx) {
  const selection = imageEditorState.selection;
  if (!selection) return;
  const overlap = intersectImageEditorSelection(selection);
  ctx.save();
  if (imageEditorState.mode === "remove" && overlap) {
    ctx.fillStyle = "rgba(239, 68, 68, .28)";
    const polygon = imageEditorSelectionPolygon(selection);
    ctx.beginPath();
    ctx.moveTo(polygon[0].x, polygon[0].y);
    polygon.slice(1).forEach(point => ctx.lineTo(point.x, point.y));
    ctx.closePath();
    ctx.fill();
  } else if (imageEditorState.mode === "cover" && overlap) {
    ctx.fillStyle = "rgba(22, 119, 255, .18)";
    ctx.beginPath();
    if (imageEditorState.coverShape === "ellipse") {
      ctx.ellipse(
        overlap.x + overlap.width / 2,
        overlap.y + overlap.height / 2,
        Math.max(1, overlap.width / 2),
        Math.max(1, overlap.height / 2),
        0,
        0,
        Math.PI * 2
      );
    } else {
      ctx.rect(overlap.x, overlap.y, overlap.width, overlap.height);
    }
    ctx.fill();
  } else if (imageEditorState.mode === "crop") {
    const canvas = imageEditorState.documentCanvas;
    ctx.fillStyle = "rgba(15, 23, 42, .48)";
    ctx.beginPath();
    ctx.rect(0, 0, canvas.width, canvas.height);
    ctx.rect(selection.x, selection.y, selection.width, selection.height);
    ctx.fill("evenodd");
  }
  ctx.restore();
}

function drawImageEditorGradient(ctx, width, height, gradient = imageEditorState.gradient) {
  if (!gradient) return;
  const dx = gradient.end.x - gradient.start.x;
  const dy = gradient.end.y - gradient.start.y;
  if (Math.hypot(dx, dy) < 2) return;
  ctx.save();
  ctx.globalCompositeOperation = "destination-in";
  const mask = ctx.createLinearGradient(gradient.start.x, gradient.start.y, gradient.end.x, gradient.end.y);
  mask.addColorStop(0, "rgba(0,0,0,0)");
  mask.addColorStop(1, "rgba(0,0,0,1)");
  ctx.fillStyle = mask;
  ctx.fillRect(0, 0, width, height);
  ctx.restore();
}

function renderImageEditorCanvas() {
  if (!imageEditorState.hasImage) return;
  const canvas = imageEditorCanvas();
  const source = imageEditorState.documentCanvas;
  // 只在尺寸真的变化时才重设：赋值 width/height 会让浏览器丢弃整个画布位图，
  // 拖动角点时每帧重设会造成明显的闪烁与掉帧。
  if (canvas.width !== source.width) canvas.width = source.width;
  if (canvas.height !== source.height) canvas.height = source.height;
  const ctx = canvas.getContext("2d");
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  const screenState = imageEditorState.screen;
  if (imageEditorState.mode === "screen" && screenState && screenState.preview) {
    ctx.drawImage(screenState.preview, 0, 0, canvas.width, canvas.height);
  } else if (["split", "blend"].includes(imageEditorState.mode) && imageEditorState.secondImage) {
    drawImageEditorComposite(ctx, canvas.width, canvas.height, true);
  } else {
    ctx.drawImage(source, 0, 0);
  }
  if (imageEditorState.mode === "gradient" && imageEditorState.gradient) {
    drawImageEditorGradient(ctx, canvas.width, canvas.height);
  }
  drawImageEditorSelection(ctx);
  requestAnimationFrame(syncImageEditorOverlays);
}

function imageEditorCanvasPointToStage(point) {
  const stage = $("#imageEditorStage");
  const canvas = imageEditorCanvas();
  const stageRect = stage.getBoundingClientRect();
  const canvasRect = canvas.getBoundingClientRect();
  return {
    x: canvasRect.left - stageRect.left + stage.scrollLeft + point.x * canvasRect.width / canvas.width,
    y: canvasRect.top - stageRect.top + stage.scrollTop + point.y * canvasRect.height / canvas.height,
  };
}

function imageEditorSnapTargets() {
  const stage = $("#imageEditorStage");
  const canvas = imageEditorCanvas();
  const stageRect = stage.getBoundingClientRect();
  const canvasRect = canvas.getBoundingClientRect();
  const scaleX = canvas.width / Math.max(1, canvasRect.width);
  const scaleY = canvas.height / Math.max(1, canvasRect.height);
  const unique = values => [...new Set(values.map(value => Math.round(value * 1000) / 1000))];
  return {
    x: unique([
      0,
      canvas.width,
      (stageRect.left - canvasRect.left) * scaleX,
      (stageRect.right - canvasRect.left) * scaleX,
    ]),
    y: unique([
      0,
      canvas.height,
      (stageRect.top - canvasRect.top) * scaleY,
      (stageRect.bottom - canvasRect.top) * scaleY,
    ]),
    toleranceX: 10 * scaleX,
    toleranceY: 10 * scaleY,
  };
}

function snapImageEditorPoint(point, axes = "both") {
  const targets = imageEditorSnapTargets();
  const xMatch = axes !== "y" ? nearestSnap(point.x, targets.x, targets.toleranceX) : null;
  const yMatch = axes !== "x" ? nearestSnap(point.y, targets.y, targets.toleranceY) : null;
  return {
    point: {
      x: xMatch?.value ?? point.x,
      y: yMatch?.value ?? point.y,
    },
    guides: {
      vertical: xMatch ? [xMatch.value] : [],
      horizontal: yMatch ? [yMatch.value] : [],
    },
  };
}

function renderImageEditorSnapGuides() {
  const host = $("#imageEditorSnapGuides");
  host.innerHTML = "";
  const guides = imageEditorState.snapGuides;
  guides.vertical.forEach(x => {
    const line = document.createElement("i");
    line.className = "vertical";
    line.style.left = `${imageEditorCanvasPointToStage({ x, y: 0 }).x}px`;
    host.appendChild(line);
  });
  guides.horizontal.forEach(y => {
    const line = document.createElement("i");
    line.className = "horizontal";
    line.style.top = `${imageEditorCanvasPointToStage({ x: 0, y }).y}px`;
    host.appendChild(line);
  });
  host.hidden = !host.children.length;
}

function syncImageEditorOverlays() {
  const selectionOverlay = $("#imageEditorSelectionOverlay");
  const gradientOverlay = $("#imageEditorGradientOverlay");
  const selection = imageEditorState.selection;
  selectionOverlay.hidden = !selection;
  selectionOverlay.classList.toggle(
    "is-adjusting",
    ["create", "adjust", "shear", "move-selection"].includes(imageEditorState.interaction?.mode)
  );
  if (selection) {
    syncCanvasSelectionOverlay(
      $("#imageEditorStage"),
      imageEditorCanvas(),
      selectionOverlay,
      selection
    );
    const horizontalShear = imageEditorState.mode === "remove" && imageEditorRemovalIsHorizontal(selection);
    const skew = imageEditorState.mode === "remove" ? Number(selection.skew) || 0 : 0;
    const canvasRect = imageEditorCanvas().getBoundingClientRect();
    const displaySkew = horizontalShear
      ? skew * canvasRect.height / Math.max(1, imageEditorCanvas().height)
      : skew * canvasRect.width / Math.max(1, imageEditorCanvas().width);
    const displaySpan = horizontalShear
      ? selection.width * canvasRect.width / Math.max(1, imageEditorCanvas().width)
      : selection.height * canvasRect.height / Math.max(1, imageEditorCanvas().height);
    const shearAngle = Math.atan2(displaySkew, Math.max(1, displaySpan));
    selectionOverlay.style.transformOrigin = "0 0";
    selectionOverlay.style.transform = skew
      ? `${horizontalShear ? "skewY" : "skewX"}(${shearAngle}rad)`
      : "";
    selectionOverlay.style.setProperty(
      "--selection-counter-transform",
      skew ? `${horizontalShear ? "skewY" : "skewX"}(${-shearAngle}rad)` : "none"
    );
    selectionOverlay.classList.toggle("is-shear-y", horizontalShear);
    selectionOverlay.classList.toggle("is-shear-x", !horizontalShear && imageEditorState.mode === "remove");
  } else {
    selectionOverlay.style.transform = "";
    selectionOverlay.style.removeProperty("--selection-counter-transform");
    selectionOverlay.classList.remove("is-shear-y", "is-shear-x");
  }
  const gradient = imageEditorState.gradient;
  gradientOverlay.hidden = !gradient;
  gradientOverlay.classList.toggle(
    "is-adjusting",
    Boolean(imageEditorState.interaction?.mode?.startsWith("gradient"))
  );
  if (gradient) {
    const start = imageEditorCanvasPointToStage(gradient.start);
    const end = imageEditorCanvasPointToStage(gradient.end);
    const dx = end.x - start.x;
    const dy = end.y - start.y;
    const length = Math.max(1, Math.hypot(dx, dy));
    const actionX = dx + 12;
    const actionY = dy;
    gradientOverlay.style.left = `${start.x}px`;
    gradientOverlay.style.top = `${start.y}px`;
    gradientOverlay.style.setProperty("--gradient-length", `${length}px`);
    gradientOverlay.style.setProperty("--gradient-angle", `${Math.atan2(dy, dx)}rad`);
    gradientOverlay.style.setProperty("--gradient-end-x", `${dx}px`);
    gradientOverlay.style.setProperty("--gradient-end-y", `${dy}px`);
    gradientOverlay.style.setProperty("--gradient-actions-x", `${actionX}px`);
    gradientOverlay.style.setProperty("--gradient-actions-y", `${actionY}px`);
  }
  renderImageEditorSnapGuides();
  imageEditorScreenSyncOverlay();
}

// —— 局部修复（圆形笔刷 + 周边像素填充）——
let imageEditorInpaintCursor = null;
let imageEditorInpaintClient = null;

function ensureImageEditorInpaintCursor() {
  if (imageEditorInpaintCursor) return imageEditorInpaintCursor;
  const cursor = document.createElement("div");
  cursor.className = "brush-cursor";
  cursor.hidden = true;
  $("#imageEditorStage").appendChild(cursor);
  imageEditorInpaintCursor = cursor;
  return cursor;
}

function imageEditorInpaintDisplaySize() {
  return Math.max(10, imageEditorState.inpaintSize);
}

function updateImageEditorInpaintCursor(clientX, clientY) {
  const cursor = ensureImageEditorInpaintCursor();
  imageEditorInpaintClient = { x: clientX, y: clientY };
  if (!imageEditorState.hasImage || imageEditorState.mode !== "inpaint") {
    cursor.hidden = true;
    return cursor;
  }
  const stage = $("#imageEditorStage");
  const stageRect = stage.getBoundingClientRect();
  const inside = clientX >= stageRect.left && clientX <= stageRect.right &&
    clientY >= stageRect.top && clientY <= stageRect.bottom;
  cursor.hidden = !inside;
  if (!inside) return cursor;
  const size = imageEditorInpaintDisplaySize();
  cursor.style.width = `${size}px`;
  cursor.style.height = `${size}px`;
  cursor.style.left = `${clientX - stageRect.left + stage.scrollLeft}px`;
  cursor.style.top = `${clientY - stageRect.top + stage.scrollTop}px`;
  return cursor;
}

function refreshImageEditorInpaintCursor() {
  if (imageEditorInpaintClient &&
      imageEditorState.hasImage &&
      imageEditorState.mode === "inpaint") {
    updateImageEditorInpaintCursor(imageEditorInpaintClient.x, imageEditorInpaintClient.y);
  }
}

function hideImageEditorInpaintCursor() {
  imageEditorInpaintClient = null;
  if (imageEditorInpaintCursor) imageEditorInpaintCursor.hidden = true;
}

function previewInpaintCircle(cx, cy) {
  // 拖动过程中的快速预览：沿径向取边界像素直接覆盖，保证手感流畅。
  // 松手后会对整条笔画重新执行一次高质量扩散填充。
  const canvas = imageEditorState.documentCanvas;
  const radius = Math.max(1, imageEditorState.inpaintSize / 2 / Math.max(0.01, imageEditorState.zoom));
  const left = Math.max(0, Math.floor(cx - radius));
  const top = Math.max(0, Math.floor(cy - radius));
  const right = Math.min(canvas.width, Math.ceil(cx + radius));
  const bottom = Math.min(canvas.height, Math.ceil(cy + radius));
  const w = right - left;
  const h = bottom - top;
  if (w <= 0 || h <= 0) return;
  const ctx = canvas.getContext("2d");
  const imageData = ctx.getImageData(left, top, w, h);
  const data = imageData.data;
  const cx0 = cx - left;
  const cy0 = cy - top;
  const r2 = radius * radius;
  const sampleRadius = Math.ceil(radius * 1.05) + 2;
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const dx = x - cx0;
      const dy = y - cy0;
      if (dx * dx + dy * dy > r2) continue;
      const dist = Math.sqrt(dx * dx + dy * dy) || 1;
      const stepX = dx / dist;
      const stepY = dy / dist;
      let sx = cx0 + dx;
      let sy = cy0 + dy;
      let foundPixel = null;
      for (let r = Math.ceil(dist); r <= sampleRadius; r++) {
        sx += stepX;
        sy += stepY;
        const px = Math.round(sx);
        const py = Math.round(sy);
        if (px < 0 || px >= w || py < 0 || py >= h) continue;
        const pdx = px - cx0;
        const pdy = py - cy0;
        if (pdx * pdx + pdy * pdy > r2) {
          const idx = (py * w + px) * 4;
          foundPixel = [data[idx], data[idx + 1], data[idx + 2], data[idx + 3]];
          break;
        }
      }
      if (foundPixel) {
        const idx = (y * w + x) * 4;
        data[idx] = foundPixel[0];
        data[idx + 1] = foundPixel[1];
        data[idx + 2] = foundPixel[2];
        data[idx + 3] = foundPixel[3];
      }
    }
  }
  ctx.putImageData(imageData, left, top);
}

// 高质量扩散填充：把 mask 标记的像素视为未知，从边界向内做多源 BFS 分层
// 初始化，再做若干轮 Gauss-Seidel 平滑。等价于求 Laplace 方程的调和解：
// 纯色背景完美还原，线性渐变天然还原，粗笔画大区域也能从四周均匀收敛。
function runDiffusionInpaint(data, mask, w, h) {
  const total = w * h;
  const filled = new Uint8Array(total);
  let unknownCount = 0;
  for (let i = 0; i < total; i++) {
    if (mask[i]) unknownCount++;
    else filled[i] = 1;
  }
  if (!unknownCount) return;
  // 迭代次数随区域大小自适应，超大区域也能在可接受时间内完成。
  const smoothIterations = unknownCount > 2500000 ? 3 : unknownCount > 900000 ? 6 : 14;

  // —— 多源 BFS：从与已知像素相邻的未知像素开始，逐层向内初始化 ——
  let frontier = [];
  for (let i = 0; i < total; i++) {
    if (!mask[i]) continue;
    const x = i % w;
    if ((x > 0 && !mask[i - 1]) || (x < w - 1 && !mask[i + 1]) ||
        (i >= w && !mask[i - w]) || (i < total - w && !mask[i + w])) {
      frontier.push(i);
    }
  }
  const queued = new Uint8Array(total);
  while (frontier.length) {
    for (const i of frontier) {
      const x = i % w;
      let r = 0, g = 0, b = 0, a = 0, n = 0;
      if (x > 0 && filled[i - 1]) { const j = (i - 1) * 4; r += data[j]; g += data[j + 1]; b += data[j + 2]; a += data[j + 3]; n++; }
      if (x < w - 1 && filled[i + 1]) { const j = (i + 1) * 4; r += data[j]; g += data[j + 1]; b += data[j + 2]; a += data[j + 3]; n++; }
      if (i >= w && filled[i - w]) { const j = (i - w) * 4; r += data[j]; g += data[j + 1]; b += data[j + 2]; a += data[j + 3]; n++; }
      if (i < total - w && filled[i + w]) { const j = (i + w) * 4; r += data[j]; g += data[j + 1]; b += data[j + 2]; a += data[j + 3]; n++; }
      if (n) {
        const j = i * 4;
        data[j] = r / n;
        data[j + 1] = g / n;
        data[j + 2] = b / n;
        data[j + 3] = a / n;
      }
    }
    for (const i of frontier) filled[i] = 1;
    const next = [];
    for (const i of frontier) {
      const x = i % w;
      if (x > 0 && mask[i - 1] && !filled[i - 1] && !queued[i - 1]) { queued[i - 1] = 1; next.push(i - 1); }
      if (x < w - 1 && mask[i + 1] && !filled[i + 1] && !queued[i + 1]) { queued[i + 1] = 1; next.push(i + 1); }
      if (i >= w && mask[i - w] && !filled[i - w] && !queued[i - w]) { queued[i - w] = 1; next.push(i - w); }
      if (i < total - w && mask[i + w] && !filled[i + w] && !queued[i + w]) { queued[i + w] = 1; next.push(i + w); }
    }
    frontier = next;
  }

  // —— 全局 Gauss-Seidel 平滑：让渐变过渡更顺滑、消除分层痕迹 ——
  for (let iter = 0; iter < smoothIterations; iter++) {
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const i = y * w + x;
        if (!mask[i]) continue;
        let r = 0, g = 0, b = 0, a = 0, n = 0;
        if (x > 0) { const j = (i - 1) * 4; r += data[j]; g += data[j + 1]; b += data[j + 2]; a += data[j + 3]; n++; }
        if (x < w - 1) { const j = (i + 1) * 4; r += data[j]; g += data[j + 1]; b += data[j + 2]; a += data[j + 3]; n++; }
        if (y > 0) { const j = (i - w) * 4; r += data[j]; g += data[j + 1]; b += data[j + 2]; a += data[j + 3]; n++; }
        if (y < h - 1) { const j = (i + w) * 4; r += data[j]; g += data[j + 1]; b += data[j + 2]; a += data[j + 3]; n++; }
        if (n) {
          const j = i * 4;
          data[j] = r / n;
          data[j + 1] = g / n;
          data[j + 2] = b / n;
          data[j + 3] = a / n;
        }
      }
    }
  }
}

function inpaintImageEditorRegion(circles) {
  // 对一组圆形区域（笔画覆盖范围）做并集 mask，然后执行扩散填充。
  const canvas = imageEditorState.documentCanvas;
  if (!circles?.length) return false;
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  circles.forEach(circle => {
    minX = Math.min(minX, circle.x - circle.r);
    minY = Math.min(minY, circle.y - circle.r);
    maxX = Math.max(maxX, circle.x + circle.r);
    maxY = Math.max(maxY, circle.y + circle.r);
  });
  const left = Math.max(0, Math.floor(minX));
  const top = Math.max(0, Math.floor(minY));
  const right = Math.min(canvas.width, Math.ceil(maxX));
  const bottom = Math.min(canvas.height, Math.ceil(maxY));
  const w = right - left;
  const h = bottom - top;
  if (w <= 0 || h <= 0) return false;
  const ctx = canvas.getContext("2d");
  const imageData = ctx.getImageData(left, top, w, h);
  const mask = new Uint8Array(w * h);
  circles.forEach(circle => {
    const cx = circle.x - left;
    const cy = circle.y - top;
    const r2 = circle.r * circle.r;
    const y0 = Math.max(0, Math.floor(cy - circle.r));
    const y1 = Math.min(h - 1, Math.ceil(cy + circle.r));
    const x0 = Math.max(0, Math.floor(cx - circle.r));
    const x1 = Math.min(w - 1, Math.ceil(cx + circle.r));
    for (let y = y0; y <= y1; y++) {
      const dy = y - cy;
      for (let x = x0; x <= x1; x++) {
        const dx = x - cx;
        if (dx * dx + dy * dy <= r2) mask[y * w + x] = 1;
      }
    }
  });
  runDiffusionInpaint(imageData.data, mask, w, h);
  ctx.putImageData(imageData, left, top);
  return true;
}

// 智能覆盖用到的取色环：选区往外这么宽的一圈像素用来统计底色。
const COVER_RING_WIDTH = 10;
// 颜色量化位数：每通道右移 3 位（8 级一档），抵消截图压缩带来的细微噪点，
// 统计完再用同档像素的均值还原，纯色背景能取回原色。
const COVER_COLOR_SHIFT = 3;

function traceImageEditorCoverShape(ctx, x, y, w, h, shape = imageEditorState.coverShape) {
  ctx.beginPath();
  if (shape === "ellipse") {
    ctx.ellipse(x + w / 2, y + h / 2, w / 2, h / 2, 0, 0, Math.PI * 2);
  } else {
    ctx.rect(x, y, w, h);
  }
}

// 选出「选区往外 COVER_RING_WIDTH 一圈」的像素：按形状描一圈粗边（线宽＝两倍环宽，
// 一半压在选区里），再把选区本身挖掉，剩下的就是外侧那圈。
function coverRingMask(x, y, w, h, left, top, ringWidth, ringHeight, shape) {
  const maskCanvas = document.createElement("canvas");
  maskCanvas.width = ringWidth;
  maskCanvas.height = ringHeight;
  const ctx = maskCanvas.getContext("2d");
  ctx.translate(-left, -top);
  ctx.lineWidth = COVER_RING_WIDTH * 2;
  ctx.strokeStyle = "#fff";
  traceImageEditorCoverShape(ctx, x, y, w, h, shape);
  ctx.stroke();
  ctx.globalCompositeOperation = "destination-out";
  traceImageEditorCoverShape(ctx, x, y, w, h, shape);
  ctx.fill();
  return ctx.getImageData(0, 0, ringWidth, ringHeight).data;
}

// 统计取色环里占比最高的颜色，返回该档像素的平均色。
function dominantCoverRingColor(canvas, x, y, w, h, shape) {
  const ring = COVER_RING_WIDTH;
  const left = Math.max(0, x - ring);
  const top = Math.max(0, y - ring);
  const right = Math.min(canvas.width, x + w + ring);
  const bottom = Math.min(canvas.height, y + h + ring);
  const ringWidth = right - left;
  const ringHeight = bottom - top;
  if (ringWidth < 1 || ringHeight < 1) return null;
  const source = canvas.getContext("2d").getImageData(left, top, ringWidth, ringHeight).data;
  const mask = coverRingMask(x, y, w, h, left, top, ringWidth, ringHeight, shape);
  const buckets = new Map();
  let best = null;
  for (let index = 0; index < ringWidth * ringHeight; index++) {
    if (mask[index * 4 + 3] < 128) continue;
    const at = index * 4;
    if (source[at + 3] < 128) continue;
    const key =
      ((source[at] >> COVER_COLOR_SHIFT) << 10) |
      ((source[at + 1] >> COVER_COLOR_SHIFT) << 5) |
      (source[at + 2] >> COVER_COLOR_SHIFT);
    let bucket = buckets.get(key);
    if (!bucket) {
      bucket = { count: 0, r: 0, g: 0, b: 0 };
      buckets.set(key, bucket);
    }
    bucket.count += 1;
    bucket.r += source[at];
    bucket.g += source[at + 1];
    bucket.b += source[at + 2];
    if (!best || bucket.count > best.count) best = bucket;
  }
  if (!best) return null;
  return [best.r, best.g, best.b].map(total => Math.round(total / best.count));
}

function applyCoverFill(bounds) {
  // 智能覆盖：取选区外围一圈像素，找出占比最高的颜色，整个选区填成这个颜色。
  if (!bounds) return false;
  const canvas = imageEditorState.documentCanvas;
  const x = Math.round(bounds.x);
  const y = Math.round(bounds.y);
  const w = Math.round(bounds.width);
  const h = Math.round(bounds.height);
  if (w < 2 || h < 2) return false;
  const color = dominantCoverRingColor(canvas, x, y, w, h, imageEditorState.coverShape);
  const ctx = canvas.getContext("2d");
  if (!color) {
    // 四周没有可用的不透明像素（例如整片透明）时，退回原来的扩散填充。
    return applyCoverDiffusionFill(x, y, w, h);
  }
  ctx.save();
  ctx.fillStyle = `rgb(${color[0]}, ${color[1]}, ${color[2]})`;
  traceImageEditorCoverShape(ctx, x, y, w, h);
  ctx.fill();
  ctx.restore();
  return true;
}

function applyCoverDiffusionFill(x, y, w, h) {
  const canvas = imageEditorState.documentCanvas;
  const ctx = canvas.getContext("2d");
  const imageData = ctx.getImageData(x, y, w, h);
  const mask = new Uint8Array(w * h);
  if (imageEditorState.coverShape === "ellipse") {
    const cx = w / 2;
    const cy = h / 2;
    const rx = Math.max(1, w / 2);
    const ry = Math.max(1, h / 2);
    for (let py = 0; py < h; py++) {
      const ny = (py + 0.5 - cy) / ry;
      for (let px = 0; px < w; px++) {
        const nx = (px + 0.5 - cx) / rx;
        if (nx * nx + ny * ny <= 1) mask[py * w + px] = 1;
      }
    }
  } else {
    mask.fill(1);
  }
  runDiffusionInpaint(imageData.data, mask, w, h);
  ctx.putImageData(imageData, x, y);
  return true;
}

function inpaintImageEditorSegment(from, to, strokes) {
  const radius = Math.max(1, imageEditorState.inpaintSize / 2 / Math.max(0.01, imageEditorState.zoom));
  const distance = Math.hypot(to.x - from.x, to.y - from.y);
  const steps = Math.max(1, Math.ceil(distance / Math.max(1, radius / 3)));
  for (let index = 0; index <= steps; index++) {
    const ratio = index / steps;
    const x = from.x + (to.x - from.x) * ratio;
    const y = from.y + (to.y - from.y) * ratio;
    previewInpaintCircle(x, y);
    strokes?.push({ x, y, r: radius });
  }
}

function drawImageCover(ctx, image, width, height) {
  const scale = Math.max(width / image.width, height / image.height);
  const drawWidth = image.width * scale;
  const drawHeight = image.height * scale;
  ctx.drawImage(image, (width - drawWidth) / 2, (height - drawHeight) / 2, drawWidth, drawHeight);
}

function drawImageEditorDivider(ctx, width, height) {
  const position = Number($("#imageEditorDividerPosition").value) / 100;
  const angle = Number($("#imageEditorDividerAngle").value) * Math.PI / 180;
  const lineWidth = Number($("#imageEditorDividerWidth").value);
  if (lineWidth <= 0) return;
  const style = $("#imageEditorDividerStyle").value;
  const span = Math.hypot(width, height) * 1.5;
  ctx.save();
  ctx.translate(width * position, height / 2);
  ctx.rotate(angle);
  ctx.strokeStyle = $("#imageEditorDividerColor").value;
  ctx.lineWidth = lineWidth;
  ctx.lineCap = "round";
  ctx.beginPath();
  if (style === "wave") {
    for (let y = -span; y <= span; y += 12) {
      const x = Math.sin(y / 34) * 18;
      if (y === -span) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
  } else if (style === "lightning") {
    ctx.moveTo(0, -span);
    for (let y = -span + 38, direction = 1; y <= span; y += 38, direction *= -1) {
      ctx.lineTo(direction * 22, y);
    }
  } else {
    ctx.moveTo(0, -span);
    ctx.lineTo(0, span);
  }
  ctx.stroke();
  ctx.restore();
}

function drawImageEditorComposite(ctx, width, height, withGuide) {
  const source = imageEditorState.documentCanvas;
  const second = imageEditorState.secondImage;
  const position = Number($("#imageEditorDividerPosition").value) / 100;
  const angle = Number($("#imageEditorDividerAngle").value) * Math.PI / 180;
  drawImageCover(ctx, source, width, height);
  const layer = document.createElement("canvas");
  layer.width = width;
  layer.height = height;
  const layerCtx = layer.getContext("2d");
  drawImageCover(layerCtx, second, width, height);
  layerCtx.globalCompositeOperation = "destination-in";
  layerCtx.translate(width * position, height / 2);
  layerCtx.rotate(angle);
  const span = Math.hypot(width, height) * 2;
  if (imageEditorState.mode === "blend") {
    const blend = Number($("#imageEditorBlendWidth").value);
    const gradient = layerCtx.createLinearGradient(-blend / 2, 0, blend / 2, 0);
    gradient.addColorStop(0, "rgba(0,0,0,0)");
    gradient.addColorStop(1, "rgba(0,0,0,1)");
    layerCtx.fillStyle = gradient;
    layerCtx.fillRect(-blend / 2, -span, span, span * 2);
  } else {
    layerCtx.fillStyle = "#000";
    layerCtx.fillRect(0, -span, span, span * 2);
  }
  layerCtx.globalCompositeOperation = "source-over";
  ctx.drawImage(layer, 0, 0);
  if (withGuide && imageEditorState.mode === "split") drawImageEditorDivider(ctx, width, height);
}

// 「功能键扩展区」的底边收口：默认贴着自己的内容，顶边与「美化 / 标注」一样
// 从标签栏顶端起。当它和画布底边的垂直位置相差不到画布高度的 15% 时，
// 把面板撑到与画布底边齐平；差得太多（要补的空白太大）就保持自然高度。
// 窄屏是上下堆叠布局，面板铺满整行，不做这个对齐。
const IMAGE_EDITOR_INSPECTOR_ALIGN_RATIO = 0.15;
const IMAGE_EDITOR_STACK_LAYOUT_MAX_WIDTH = 900;

let imageEditorInspectorAlignFrame = 0;

function scheduleImageEditorInspectorAlign() {
  if (imageEditorInspectorAlignFrame) return;
  imageEditorInspectorAlignFrame = requestAnimationFrame(() => {
    imageEditorInspectorAlignFrame = 0;
    syncImageEditorInspectorAlign();
  });
}

function syncImageEditorInspectorAlign() {
  const inspector = $("#imageEditorInspector");
  if (!inspector) return;
  // 先撤掉上一次的定高，量到的才是内容自然高度（顶边不受高度影响）。
  inspector.style.height = "";
  if (window.innerWidth <= IMAGE_EDITOR_STACK_LAYOUT_MAX_WIDTH) return;
  const rect = inspector.getBoundingClientRect();
  if (!rect.height) return;
  const canvasRect = imageEditorCanvas().getBoundingClientRect();
  if (!canvasRect.height) return;
  const offset = Math.abs(rect.bottom - canvasRect.bottom);
  if (offset > canvasRect.height * IMAGE_EDITOR_INSPECTOR_ALIGN_RATIO) return;
  const height = canvasRect.bottom - rect.top;
  if (height <= 0) return;
  inspector.style.height = `${Math.round(height)}px`;
}

function applyImageEditorZoom(zoom) {
  if (!imageEditorState.hasImage || !imageEditorState.baseDisplayWidth) return;
  const canvas = imageEditorCanvas();
  imageEditorState.zoom = Math.max(0.5, Math.min(20, zoom));
  canvas.style.width = `${imageEditorState.baseDisplayWidth * imageEditorState.zoom}px`;
  canvas.style.height = `${imageEditorState.baseDisplayHeight * imageEditorState.zoom}px`;
  canvas.style.imageRendering = imageEditorState.zoom >= 4 ? "pixelated" : "auto";
  $("#imageEditorStage").classList.toggle("at-base-zoom", imageEditorState.zoom <= 1.001);
  const zoomPercent = Math.round(imageEditorState.zoom * 100);
  $("#imageEditorCanvasZoom").value = String(zoomPercent);
  $("#imageEditorCanvasZoomValue").textContent = `${zoomPercent}%`;
  requestAnimationFrame(() => {
    syncImageEditorOverlays();
    imageEditorScreenRefreshMagnifier();
    refreshImageEditorInpaintCursor();
    syncImageEditorInspectorAlign();
  });
}

// 重新测量「100% 时的显示尺寸」，再恢复到 targetZoom。
// 切换画布标签时会带上该标签自己的缩放比例，不重置成 100%。
// preserveView：重新测量期间画布会先缩回原始尺寸，浏览器会把滚动位置夹小，
// 撤销 / 重做回放历史时用它把用户的画面位置原样放回去。
function resetImageEditorZoom(targetZoom = 1, { preserveView = false } = {}) {
  const canvas = imageEditorCanvas();
  const stage = $("#imageEditorStage");
  const tabId = activeImageEditorTabId;
  const scrollLeft = preserveView ? stage?.scrollLeft || 0 : 0;
  const scrollTop = preserveView ? stage?.scrollTop || 0 : 0;
  const zoom = Math.max(0.5, Math.min(20, Number(targetZoom) || 1));
  imageEditorState.zoom = zoom;
  imageEditorState.baseDisplayWidth = 0;
  imageEditorState.baseDisplayHeight = 0;
  canvas.style.width = "";
  canvas.style.height = "";
  canvas.style.maxWidth = "";
  canvas.style.maxHeight = "";
  requestAnimationFrame(() => {
    if (activeImageEditorTabId !== tabId || !imageEditorState.hasImage) return;
    const rect = canvas.getBoundingClientRect();
    // 用统一比例换算，避免宽高分别取整后把画布拉变形。
    const scale = Math.min(
      rect.width / Math.max(1, canvas.width),
      rect.height / Math.max(1, canvas.height)
    );
    imageEditorState.baseDisplayWidth = canvas.width * scale;
    imageEditorState.baseDisplayHeight = canvas.height * scale;
    canvas.style.maxWidth = "none";
    canvas.style.maxHeight = "none";
    applyImageEditorZoom(zoom);
    if (preserveView && stage) {
      stage.scrollLeft = scrollLeft;
      stage.scrollTop = scrollTop;
    }
  });
}

async function loadImageEditorFile(file, sourceBg = null) {
  if (!file) return;
  const url = URL.createObjectURL(file);
  try {
    const image = await loadImageSource(url);
    const documentCanvas = document.createElement("canvas");
    documentCanvas.width = image.naturalWidth;
    documentCanvas.height = image.naturalHeight;
    documentCanvas.getContext("2d").drawImage(image, 0, 0);
    imageEditorState.documentCanvas = documentCanvas;
    imageEditorState.sourceName = file.name;
    imageEditorState.hasImage = true;
    imageEditorState.mode = "view";
    imageEditorState.selection = null;
    imageEditorState.interaction = null;
    imageEditorState.gradient = null;
    imageEditorState.snapGuides = emptySnapGuides();
    imageEditorState.history = [];
    imageEditorState.historyIndex = -1;
    imageEditorState.sourceBgMaterialIndex = sourceBg?.materialIndex ?? null;
    imageEditorState.sourceBgLayerId = sourceBg?.layerId ?? null;
    imageEditorState.screen = null;
    pushImageEditorHistory();
    $("#imageEditorStage").classList.add("has-image");
    renderImageEditorCanvas();
    resetImageEditorZoom();
    updateImageEditorControls();
    syncActiveImageEditorTabTitle();
    imageEditorStatus(`${image.naturalWidth} × ${image.naturalHeight}px · 已导入原图`);
  } finally {
    URL.revokeObjectURL(url);
  }
}

// —— 换屏：把一张截图按透视贴到画面里的屏幕位置上 ——
// 四角 → 单应矩阵 → 逐像素反向映射。反向映射没有网格分片法的接缝与空洞，
// 边缘覆盖率、光照调制、刘海保留都在同一个循环里完成。

const IMAGE_EDITOR_SCREEN_PREVIEW_MAX = 480;   // 拖动预览时底图的最长边（越小越跟手）

function imageEditorScreen() {
  if (!imageEditorState.screen) {
    imageEditorState.screen = {
      image: null,        // 适配后的截图 { canvas, data, width, height }
      source: null,       // 截图原图
      fitK: 0,
      corners: [],        // 四角，顺序：左上 → 右上 → 右下 → 左下
      activeCorner: -1,
      interaction: null,
      params: { light: 0.45, feather: 1.5, radius: 4, opacity: 1, fit: "stretch", notch: true },
      autoSnap: true,
      notch: null,
      preview: null,      // 预览缓存画布
      previewScale: 1,
      fastCanvas: null,
      fullCanvas: null,
      rafPending: false,
      fullTimer: 0,
      baseData: null,
      baseCanvas: null,          // 贴合前的底图，用于再次进入时继续调整
      appliedHistoryIndex: null,
      magnifierFocus: null,      // 放大镜当前对准的画布坐标
      editHistory: [],           // 未确认的四角、贴图与参数也可撤销 / 重做
      editHistoryIndex: -1,
    };
  }
  return imageEditorState.screen;
}

function imageEditorScreenClamp(value, lo, hi) {
  return value < lo ? lo : (value > hi ? hi : value);
}

function imageEditorScreenSnapshot() {
  const screen = imageEditorScreen();
  return {
    corners: screen.corners.map(point => ({ x: point.x, y: point.y })),
    params: { ...screen.params },
    source: screen.source,
    image: screen.image,
    fitK: screen.fitK,
    notch: screen.notch,
  };
}

function imageEditorScreenHistorySignature(snapshot) {
  return JSON.stringify({
    corners: snapshot.corners.map(point => [Math.round(point.x * 100) / 100, Math.round(point.y * 100) / 100]),
    params: snapshot.params,
    source: snapshot.source ? [snapshot.source.width, snapshot.source.height] : null,
    fitK: Math.round(snapshot.fitK * 1000) / 1000,
  });
}

function pushImageEditorScreenHistory() {
  const screen = imageEditorScreen();
  const snapshot = imageEditorScreenSnapshot();
  snapshot.signature = imageEditorScreenHistorySignature(snapshot);
  if (screen.editHistory[screen.editHistoryIndex]?.signature === snapshot.signature) return;
  screen.editHistory = screen.editHistory.slice(0, screen.editHistoryIndex + 1);
  screen.editHistory.push(snapshot);
  if (screen.editHistory.length > 30) screen.editHistory.shift();
  screen.editHistoryIndex = screen.editHistory.length - 1;
  updateImageEditorControls();
}

function restoreImageEditorScreenHistory(index) {
  const screen = imageEditorScreen();
  const snapshot = screen.editHistory[index];
  if (!snapshot) return;
  screen.editHistoryIndex = index;
  screen.corners = snapshot.corners.map(point => ({ x: point.x, y: point.y }));
  screen.params = { ...snapshot.params };
  screen.source = snapshot.source;
  screen.image = snapshot.image;
  screen.fitK = snapshot.fitK;
  screen.notch = snapshot.notch;
  screen.activeCorner = -1;
  screen.interaction = null;
  imageEditorScreenSyncParamLabels();
  imageEditorScreenUpdatePreview("full");
  updateImageEditorControls();
  imageEditorStatus(`已恢复换屏步骤 ${index + 1} / ${screen.editHistory.length}。`);
}

function runImageEditorHistory(redo) {
  if (imageEditorState.mode === "screen") {
    restoreImageEditorScreenHistory(imageEditorScreen().editHistoryIndex + (redo ? 1 : -1));
  } else {
    restoreImageEditorHistory(imageEditorState.historyIndex + (redo ? 1 : -1));
  }
}

// 滑杆旁的数值显示，和「美化 / 标注」里的控件保持同一种反馈方式。
function imageEditorScreenSyncParamLabels() {
  const params = imageEditorScreen().params;
  const labels = [
    ["#imageEditorScreenLightValue", `${Math.round(imageEditorScreenClamp(params.light, 0, 1) * 100)}%`],
    ["#imageEditorScreenFeatherValue", `${Number(params.feather).toFixed(1)} px`],
    ["#imageEditorScreenRadiusValue", `${Math.round(params.radius)} px`],
    ["#imageEditorScreenOpacityValue", `${Math.round(imageEditorScreenClamp(params.opacity, 0, 1) * 100)}%`],
  ];
  labels.forEach(([selector, text]) => {
    const el = $(selector);
    if (el) el.textContent = text;
  });
  const values = [
    ["#imageEditorScreenLight", Math.round(params.light * 100)],
    ["#imageEditorScreenFeather", params.feather],
    ["#imageEditorScreenRadius", params.radius],
    ["#imageEditorScreenOpacity", Math.round(params.opacity * 100)],
  ];
  values.forEach(([selector, value]) => {
    const input = $(selector);
    if (input) input.value = String(value);
  });
  if ($("#imageEditorScreenFit")) $("#imageEditorScreenFit").value = params.fit;
  if ($("#imageEditorScreenNotch")) $("#imageEditorScreenNotch").checked = params.notch;
}

function imageEditorScreenSmoothstep(t) {
  return t * t * (3 - 2 * t);
}

function imageEditorScreenDist(a, b) {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

// 解 8 元线性方程组，求把 src[4] 映射到 dst[4] 的 3×3 矩阵
function imageEditorScreenHomography(src, dst) {
  const a = [];
  for (let i = 0; i < 4; i++) {
    const sx = src[i].x, sy = src[i].y, dx = dst[i].x, dy = dst[i].y;
    a.push([sx, sy, 1, 0, 0, 0, -sx * dx, -sy * dx, dx]);
    a.push([0, 0, 0, sx, sy, 1, -sx * dy, -sy * dy, dy]);
  }
  for (let col = 0; col < 8; col++) {
    let pivot = col;
    for (let r = col + 1; r < 8; r++) {
      if (Math.abs(a[r][col]) > Math.abs(a[pivot][col])) pivot = r;
    }
    if (Math.abs(a[pivot][col]) < 1e-10) return null;
    const tmp = a[col]; a[col] = a[pivot]; a[pivot] = tmp;
    const p = a[col][col];
    for (let c = col; c < 9; c++) a[col][c] /= p;
    for (let r = 0; r < 8; r++) {
      if (r === col) continue;
      const f = a[r][col];
      if (!f) continue;
      for (let c = col; c < 9; c++) a[r][c] -= f * a[col][c];
    }
  }
  return [a[0][8], a[1][8], a[2][8], a[3][8], a[4][8], a[5][8], a[6][8], a[7][8], 1];
}

function imageEditorScreenQuadBox(corners, cw, ch, pad) {
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  for (const p of corners) {
    if (p.x < minX) minX = p.x;
    if (p.y < minY) minY = p.y;
    if (p.x > maxX) maxX = p.x;
    if (p.y > maxY) maxY = p.y;
  }
  const x = Math.max(0, Math.floor(minX - pad));
  const y = Math.max(0, Math.floor(minY - pad));
  const right = Math.min(cw, Math.ceil(maxX + pad));
  const bottom = Math.min(ch, Math.ceil(maxY + pad));
  if (right - x < 1 || bottom - y < 1) return null;
  return { x, y, width: right - x, height: bottom - y };
}

function imageEditorScreenQuadCenter(corners) {
  return {
    x: (corners[0].x + corners[1].x + corners[2].x + corners[3].x) / 4,
    y: (corners[0].y + corners[1].y + corners[2].y + corners[3].y) / 4,
  };
}

function imageEditorScreenQuadSize(corners) {
  return {
    width: (imageEditorScreenDist(corners[0], corners[1]) + imageEditorScreenDist(corners[3], corners[2])) / 2,
    height: (imageEditorScreenDist(corners[0], corners[3]) + imageEditorScreenDist(corners[1], corners[2])) / 2,
  };
}

function imageEditorScreenPointInQuad(point, corners) {
  let sign = 0;
  for (let i = 0; i < 4; i++) {
    const a = corners[i], b = corners[(i + 1) % 4];
    const cross = (b.x - a.x) * (point.y - a.y) - (b.y - a.y) * (point.x - a.x);
    if (Math.abs(cross) < 1e-9) continue;
    const s = cross > 0 ? 1 : -1;
    if (!sign) sign = s;
    else if (s !== sign) return false;
  }
  return true;
}

// 无论按什么顺序点角，都整理成 左上 → 右上 → 右下 → 左下
function imageEditorScreenNormalizeCorners() {
  const screen = imageEditorScreen();
  if (screen.corners.length !== 4) return;
  const center = imageEditorScreenQuadCenter(screen.corners);
  const sorted = screen.corners.slice().sort((a, b) =>
    Math.atan2(a.y - center.y, a.x - center.x) - Math.atan2(b.y - center.y, b.x - center.x));
  let startIndex = 0, best = Infinity;
  sorted.forEach((p, i) => {
    const d = Math.abs(Math.atan2(p.y - center.y, p.x - center.x) - (-Math.PI * 0.75));
    if (d < best) { best = d; startIndex = i; }
  });
  screen.corners = [0, 1, 2, 3].map(i => sorted[(startIndex + i) % 4]);
}

// 屏幕内部的光照分布：只统计四边形内部的像素，外部格子用邻居扩散填充。
// 直接把包围盒做低通会让黑色边框与刘海的暗度渗进来，把屏幕边缘压暗出一圈灰带。
// data 复用调用方已经读到的包围盒像素：这里再 getImageData 一次等于多付一次
// GPU 回读，拖动预览时最明显。
function imageEditorScreenBuildLightField(bbox, H, sw, sh, data) {
  const SW = 24;
  const SH = Math.max(6, Math.round(SW * bbox.height / Math.max(1, bbox.width)));
  const cellW = bbox.width / SW;
  const cellH = bbox.height / SH;
  const sum = new Float64Array(SW * SH);
  const count = new Int32Array(SW * SH);

  const step = Math.max(1, Math.floor(Math.min(bbox.width, bbox.height) / 240));
  const insetU = sw * 0.05;
  const insetV = sh * 0.05;
  for (let y = 0; y < bbox.height; y += step) {
    const Y = bbox.y + y + 0.5;
    for (let x = 0; x < bbox.width; x += step) {
      const X = bbox.x + x + 0.5;
      const w = H[6] * X + H[7] * Y + 1;
      if (Math.abs(w) < 1e-9) continue;
      const u = (H[0] * X + H[1] * Y + H[2]) / w;
      const v = (H[3] * X + H[4] * Y + H[5]) / w;
      if (u < insetU || u > sw - insetU || v < insetV || v > sh - insetV) continue;
      const k = Math.min(SH - 1, (y / cellH) | 0) * SW + Math.min(SW - 1, (x / cellW) | 0);
      const pi = (y * bbox.width + x) * 4;
      sum[k] += 0.299 * data[pi] + 0.587 * data[pi + 1] + 0.114 * data[pi + 2];
      count[k]++;
    }
  }

  const cell = new Float64Array(SW * SH);
  let lumSum = 0, lumCount = 0;
  for (let k = 0; k < cell.length; k++) {
    if (count[k]) { cell[k] = sum[k] / count[k]; lumSum += cell[k]; lumCount++; }
    else cell[k] = -1;
  }
  for (let iter = 0; iter < 14; iter++) {
    const next = cell.slice();
    let empty = false;
    for (let j = 0; j < SH; j++) {
      for (let i = 0; i < SW; i++) {
        const k = j * SW + i;
        if (cell[k] >= 0) continue;
        empty = true;
        let s = 0, c = 0;
        for (let dj = -1; dj <= 1; dj++) {
          for (let di = -1; di <= 1; di++) {
            const nj = j + dj, ni = i + di;
            if (nj < 0 || ni < 0 || nj >= SH || ni >= SW) continue;
            const nk = nj * SW + ni;
            if (cell[nk] >= 0) { s += cell[nk]; c++; }
          }
        }
        if (c) next[k] = s / c;
      }
    }
    cell.set(next);
    if (!empty) break;
  }
  for (let k = 0; k < cell.length; k++) if (cell[k] < 0) cell[k] = 200;

  const field = new Float32Array(bbox.width * bbox.height);
  for (let y = 0; y < bbox.height; y++) {
    const fy = Math.min(Math.max((y + 0.5) / cellH - 0.5, 0), SH - 1);
    const j0 = fy | 0;
    const j1 = Math.min(j0 + 1, SH - 1);
    const ty = fy - j0;
    const rowBase = y * bbox.width;
    for (let x = 0; x < bbox.width; x++) {
      const fx = Math.min(Math.max((x + 0.5) / cellW - 0.5, 0), SW - 1);
      const i0 = fx | 0;
      const i1 = Math.min(i0 + 1, SW - 1);
      const tx = fx - i0;
      const a = cell[j0 * SW + i0] * (1 - tx) + cell[j0 * SW + i1] * tx;
      const b = cell[j1 * SW + i0] * (1 - tx) + cell[j1 * SW + i1] * tx;
      field[rowBase + x] = a * (1 - ty) + b * ty;
    }
  }
  return { field, avg: lumCount ? lumSum / lumCount : 128 };
}

// MacBook 屏幕顶部的刘海是硬件特征，被截图盖住会变矮。
// 沿屏幕上边界扫一条浅带，找「明显比周围暗、宽度像刘海、位置居中」的连续列。
function imageEditorScreenDetectNotch(base, corners) {
  const tl = corners[0], tr = corners[1], bl = corners[3];
  const wTop = Math.hypot(tr.x - tl.x, tr.y - tl.y);
  const hLeft = Math.hypot(bl.x - tl.x, bl.y - tl.y);
  if (wTop < 80 || hLeft < 60) return null;
  const down = { x: (bl.x - tl.x) / hLeft, y: (bl.y - tl.y) / hLeft };
  const scanDepth = Math.max(8, hLeft * 0.08);

  const minX = Math.floor(Math.min(tl.x, tr.x) - 6);
  const maxX = Math.ceil(Math.max(tl.x, tr.x) + 6);
  const minY = Math.floor(Math.min(tl.y, tr.y) - 6);
  const maxY = Math.ceil(Math.max(tl.y, tr.y) + scanDepth * 2 + 6);
  const rw = maxX - minX, rh = maxY - minY;
  if (rw < 8 || rh < 8) return null;

  const ctx = base.getContext("2d", { willReadFrequently: true });
  const region = ctx.getImageData(minX, minY, rw, rh).data;
  const lumAt = (x, y) => {
    const sx = Math.round(x - minX), sy = Math.round(y - minY);
    if (sx < 0 || sy < 0 || sx >= rw || sy >= rh) return -1;
    const i = (sy * rw + sx) * 4;
    return 0.299 * region[i] + 0.587 * region[i + 1] + 0.114 * region[i + 2];
  };

  const N = 256;
  const colLum = new Float32Array(N);
  // 只探上边界下方很浅的一层：这层一定落在刘海内部（或刘海两侧的屏幕内容），
  // 不会吃到刘海下方的屏幕内容；用平均值而不是最小值，
  // 否则屏幕上的深色文字会被误判成刘海，把左右边界撑宽
  const shallow = Math.max(5, hLeft * 0.014);
  for (let i = 0; i < N; i++) {
    const t = (i + 0.5) / N;
    const px = tl.x + (tr.x - tl.x) * t;
    const py = tl.y + (tr.y - tl.y) * t;
    let sum = 0, cnt = 0;
    for (let d = 3; d <= shallow; d += 1) {
      const l = lumAt(px + down.x * d, py + down.y * d);
      if (l >= 0) { sum += l; cnt++; }
    }
    colLum[i] = cnt ? sum / cnt : 255;
  }
  const sorted = Array.from(colLum).sort((a, b) => a - b);
  const bright = sorted[Math.floor(sorted.length * 0.8)];
  const threshold = Math.max(60, bright * 0.5);

  let best = null, start = -1;
  for (let i = 0; i <= N; i++) {
    const dark = i < N && colLum[i] < threshold;
    if (dark && start < 0) start = i;
    if (!dark && start >= 0) {
      const len = i - start;
      const center = (start + i - 1) / (2 * (N - 1));
      if (len >= N * 0.04 && len <= N * 0.45 && center > 0.25 && center < 0.75) {
        if (!best || len > best.len) best = { start, end: i - 1, len };
      }
      start = -1;
    }
  }
  if (!best) return null;

  const mid = Math.round((best.start + best.end) / 2);
  let depthSum = 0, depthCount = 0;
  for (let i = mid - 4; i <= mid + 4; i++) {
    if (i < 0 || i >= N) continue;
    const t = (i + 0.5) / N;
    const px = tl.x + (tr.x - tl.x) * t;
    const py = tl.y + (tr.y - tl.y) * t;
    let lastDark = 0;
    for (let d = 1; d <= scanDepth * 2; d += 1) {
      const l = lumAt(px + down.x * d, py + down.y * d);
      if (l < 0) break;
      if (l < threshold) lastDark = d;
    }
    depthSum += lastDark;
    depthCount++;
  }
  const depth = depthCount ? depthSum / depthCount : 0;
  if (depth < 4) return null;

  const up = { x: (tr.x - tl.x) / wTop, y: (tr.y - tl.y) / wTop };
  const pad = 3;   // 左右各留一点余量，多出来的部分交给亮度判断去覆盖
  const coreA0 = (best.start / N) * wTop;
  const coreA1 = ((best.end + 1) / N) * wTop;
  const a0 = Math.max(0, coreA0 - pad);
  const a1 = Math.min(wTop, coreA1 + pad);
  // 纵向不加余量：底边是「平直与否」最敏感的地方，多出的余量会把底边
  // 下方的屏幕内容也划进刘海范围，保留下来就是一道亮边。
  const b1 = depth;
  const cornerAt = (a, b) => ({ x: tl.x + up.x * a + down.x * b, y: tl.y + up.y * a + down.y * b });
  const pts = [cornerAt(a0, 0), cornerAt(a1, 0), cornerAt(a0, b1), cornerAt(a1, b1)];
  return {
    origin: tl,
    up,
    down,
    a0,
    a1,
    // 真实暗区的横向范围。左右 pad 只用于抗锯齿，不能让亮度噪声
    // 反过来影响整条底边。
    coreA0,
    coreA1,
    b1,
    radius: imageEditorScreenClamp(depth * 0.42, 3, 14),
    lo: 48,          // 低于此亮度视为刘海本体，保留原图
    hi: 135,         // 高于此亮度视为屏幕内容，正常被截图覆盖
    box: {
      x0: Math.min(pts[0].x, pts[1].x, pts[2].x, pts[3].x),
      x1: Math.max(pts[0].x, pts[1].x, pts[2].x, pts[3].x),
      y0: Math.min(pts[0].y, pts[1].y, pts[2].y, pts[3].y),
      y1: Math.max(pts[0].y, pts[1].y, pts[2].y, pts[3].y),
    },
  };
}

// 把截图按四角透视贴到 target 上（就地修改）。
// 刘海处：形状由几何圆角矩形决定（下边是平直线），形状内部的像素再用原图亮度区分保留还是覆盖。
function imageEditorScreenComposite(target, corners, shot, params, scale, notch) {
  if (!corners || corners.length !== 4 || !shot) return;
  const ctx = target.getContext("2d", { willReadFrequently: true });
  const cw = target.width, ch = target.height;
  const sw = shot.width, sh = shot.height;
  // 逐像素合成后，刘海用连续的 Canvas 路径一次裁切回原图。
  // 先保留合成前的画面，避免原图抗锯齿和手写羽化重复叠加。
  const notchBase = notch ? cloneCanvas(target) : null;

  const feather = Math.max(0.5, params.feather * scale);
  const radius = Math.max(0, params.radius * scale);
  const opacity = imageEditorScreenClamp(params.opacity, 0, 1);
  const lightK = imageEditorScreenClamp(params.light, 0, 1);

  let quad = corners;
  if (params.fit === "contain") {
    const center = imageEditorScreenQuadCenter(corners);
    const size = imageEditorScreenQuadSize(corners);
    const shotAR = sw / sh;
    let kx = 1, ky = 1;
    if (size.width / Math.max(1, size.height) > shotAR) {
      kx = (size.height * shotAR) / Math.max(1, size.width);
    } else {
      ky = (size.width / shotAR) / Math.max(1, size.height);
    }
    quad = corners.map(p => ({ x: center.x + (p.x - center.x) * kx, y: center.y + (p.y - center.y) * ky }));
  }

  const bbox = imageEditorScreenQuadBox(quad, cw, ch, feather + radius + 4);
  if (!bbox) return;

  const H = imageEditorScreenHomography(
    quad,
    [{ x: 0, y: 0 }, { x: sw, y: 0 }, { x: sw, y: sh }, { x: 0, y: sh }]
  );
  if (!H) return;

  const targetData = ctx.getImageData(bbox.x, bbox.y, bbox.width, bbox.height);
  const td = targetData.data;
  const sd = shot.data;

  let light = null;
  let avgLum = 128;
  if (lightK > 0.001) {
    const field = imageEditorScreenBuildLightField(bbox, H, sw, sh, td);
    light = field.field;
    avgLum = Math.max(1, field.avg);
  }

  const h0 = H[0], h1 = H[1], h2 = H[2], h3 = H[3], h4 = H[4], h5 = H[5], h6 = H[6], h7 = H[7];
  const bw = bbox.width, bh = bbox.height, ox = bbox.x, oy = bbox.y;
  const maxU = sw - 1, maxV = sh - 1;

  for (let y = 0; y < bh; y++) {
    const Y = oy + y + 0.5;
    const rowOff = y * bw;
    for (let x = 0; x < bw; x++) {
      const X = ox + x + 0.5;
      const w = h6 * X + h7 * Y + 1;
      if (w < 1e-9) continue;
      const u = (h0 * X + h1 * Y + h2) / w;
      const v = (h3 * X + h4 * Y + h5) / w;

      // ∂u/∂X、∂v/∂Y：一个目标像素对应多少截图像素，用来换算羽化与圆角宽度
      const du = Math.abs((h0 - u * h6) / w) || 1e-6;
      const dv = Math.abs((h4 - v * h7) / w) || 1e-6;
      const marginU = (feather + 3) * du;
      const marginV = (feather + 3) * dv;
      if (u < -marginU || u > maxU + marginU || v < -marginV || v > maxV + marginV) continue;

      let d = Math.min(u / du, (maxU - u) / du, v / dv, (maxV - v) / dv);
      // 斜边要同时覆盖边界内外的半个像素。只算内侧会把外侧直接截断，
      // 透视后的上下边就会呈现明显阶梯。
      const rasterAA = Math.max(0.8, scale);
      if (d < -rasterAA) continue;
      if (radius > 0.001) {
        const rU = radius * du, rV = radius * dv;
        const uu = u < rU ? u : (u > maxU - rU ? maxU - u : -1);
        const vv = v < rV ? v : (v > maxV - rV ? maxV - v : -1);
        if (uu >= 0 && vv >= 0) {
          const t = Math.hypot((rU - uu) / rU, (rV - vv) / rV);
          d = Math.min(d, (1 - t) * radius);
          if (d < -rasterAA) continue;
        }
      }
      let cover = imageEditorScreenSmoothstep(
        imageEditorScreenClamp((d + rasterAA) / (feather + rasterAA * 2), 0, 1)
      ) * opacity;
      if (cover <= 0.0015) continue;

      // 双线性采样截图；透明像素（例如窗口圆角）不覆盖原图
      const ux = u < 0 ? 0 : (u > maxU ? maxU : u);
      const vy = v < 0 ? 0 : (v > maxV ? maxV : v);
      const x0 = ux | 0, y0 = vy | 0;
      const x1 = x0 < maxU ? x0 + 1 : x0;
      const y1 = y0 < maxV ? y0 + 1 : y0;
      const fx = ux - x0, fy = vy - y0;
      const w00 = (1 - fx) * (1 - fy), w10 = fx * (1 - fy);
      const w01 = (1 - fx) * fy, w11 = fx * fy;
      const i00 = (y0 * sw + x0) * 4, i10 = (y0 * sw + x1) * 4;
      const i01 = (y1 * sw + x0) * 4, i11 = (y1 * sw + x1) * 4;
      const sa = (sd[i00 + 3] * w00 + sd[i10 + 3] * w10 + sd[i01 + 3] * w01 + sd[i11 + 3] * w11) / 255;
      const alpha = cover * sa;
      if (alpha <= 0.0015) continue;

      let cr = sd[i00] * w00 + sd[i10] * w10 + sd[i01] * w01 + sd[i11] * w11;
      let cg = sd[i00 + 1] * w00 + sd[i10 + 1] * w10 + sd[i01 + 1] * w01 + sd[i11 + 1] * w11;
      let cb = sd[i00 + 2] * w00 + sd[i10 + 2] * w10 + sd[i01 + 2] * w01 + sd[i11 + 2] * w11;

      if (light) {
        const f = 1 + (imageEditorScreenClamp(light[rowOff + x] / avgLum, 0.35, 1.9) - 1) * lightK;
        cr *= f; cg *= f; cb *= f;
      }

      const ti = (rowOff + x) * 4;
      const inv = 1 - alpha;
      td[ti] = cr * alpha + td[ti] * inv;
      td[ti + 1] = cg * alpha + td[ti + 1] * inv;
      td[ti + 2] = cb * alpha + td[ti + 2] * inv;
      td[ti + 3] = 255 * alpha + td[ti + 3] * inv;
    }
  }
  ctx.putImageData(targetData, bbox.x, bbox.y);
  if (notchBase) imageEditorScreenDrawNotchOverlay(ctx, notchBase, notch, scale);
}

function nBoxActive(notch, X, Y) {
  if (!notch) return false;
  const box = notch.box;
  return X >= box.x0 && X <= box.x1 && Y >= box.y0 && Y <= box.y1;
}

// —— 换屏：吸附精修、截图适配、预览、覆盖层、放大镜 ——

function imageEditorScreenSampleLum(data, w, h, x, y) {
  if (x < 0 || y < 0 || x > w - 1 || y > h - 1) return -1;
  const x0 = x | 0, y0 = y | 0;
  const x1 = x0 < w - 1 ? x0 + 1 : x0;
  const y1 = y0 < h - 1 ? y0 + 1 : y0;
  const fx = x - x0, fy = y - y0;
  const lumOf = i => 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
  const a = lumOf((y0 * w + x0) * 4) * (1 - fx) + lumOf((y0 * w + x1) * 4) * fx;
  const b = lumOf((y1 * w + x0) * 4) * (1 - fx) + lumOf((y1 * w + x1) * 4) * fx;
  return a * (1 - fy) + b * fy;
}

// 在 p1→p2 附近沿法向搜索亮度梯度峰值，加权最小二乘拟合出一条精细边线
function imageEditorScreenFitEdgeLine(data, w, h, p1, p2) {
  const dx = p2.x - p1.x, dy = p2.y - p1.y;
  const len = Math.hypot(dx, dy);
  if (len < 16) return null;
  const nx = -dy / len, ny = dx / len;
  const R = 10;
  const count = Math.max(10, Math.min(36, Math.round(len / 14)));
  const samples = [];

  for (let s = 0; s < count; s++) {
    const t = (s + 0.5) / count;
    if (t < 0.1 || t > 0.9) continue;
    const bx = p1.x + dx * t, by = p1.y + dy * t;
    const profile = [];
    let valid = true;
    for (let o = -R; o <= R; o++) {
      const lum = imageEditorScreenSampleLum(data, w, h, bx + nx * o, by + ny * o);
      if (lum < 0) { valid = false; break; }
      profile.push(lum);
    }
    if (!valid) continue;
    const grads = [];
    let bestIndex = -1, bestGrad = 0;
    for (let i = 1; i < profile.length; i++) {
      const g = Math.abs(profile[i] - profile[i - 1]);
      grads.push(g);
      if (g > bestGrad) { bestGrad = g; bestIndex = i - 1; }
    }
    if (bestIndex < 0 || bestGrad < 6) continue;
    const gm = bestIndex > 0 ? grads[bestIndex - 1] : bestGrad;
    const gp = bestIndex < grads.length - 1 ? grads[bestIndex + 1] : bestGrad;
    const denom = gm - 2 * bestGrad + gp;
    const delta = Math.abs(denom) > 1e-9 ? 0.5 * (gm - gp) / denom : 0;
    const offset = (bestIndex + 1 + delta) - R;
    if (Math.abs(offset) > R - 1) continue;
    samples.push({ t, off: offset, weight: bestGrad });
  }
  if (samples.length < 4) return null;

  let sw = 0, st = 0, so = 0, stt = 0, sto = 0;
  for (const s of samples) {
    const weight = s.weight;
    sw += weight; st += weight * s.t; so += weight * s.off;
    stt += weight * s.t * s.t; sto += weight * s.t * s.off;
  }
  const den = sw * stt - st * st;
  const slope = Math.abs(den) < 1e-9 ? 0 : (sw * sto - st * so) / den;
  const base = (so - slope * st) / sw;
  return {
    p: { x: p1.x + nx * base, y: p1.y + ny * base },
    d: { x: dx + nx * slope, y: dy + ny * slope },
  };
}

function imageEditorScreenIntersectLines(l1, l2) {
  const den = l1.d.x * l2.d.y - l1.d.y * l2.d.x;
  if (Math.abs(den) < 1e-9) return null;
  const t = ((l2.p.x - l1.p.x) * l2.d.y - (l2.p.y - l1.p.y) * l2.d.x) / den;
  return { x: l1.p.x + l1.d.x * t, y: l1.p.y + l1.d.y * t };
}

function imageEditorScreenRefine(indices, maxShift) {
  const screen = imageEditorScreen();
  if (screen.corners.length !== 4 || !imageEditorState.hasImage) return 0;
  const limit = maxShift === undefined ? 24 : maxShift;
  const doc = imageEditorState.documentCanvas;
  if (!screen.baseData) {
    const ctx = doc.getContext("2d", { willReadFrequently: true });
    screen.baseData = ctx.getImageData(0, 0, doc.width, doc.height).data;
  }
  const data = screen.baseData, w = doc.width, h = doc.height;
  const corners = screen.corners;
  const lines = [];
  for (let i = 0; i < 4; i++) {
    lines.push(imageEditorScreenFitEdgeLine(data, w, h, corners[i], corners[(i + 1) % 4]));
  }
  const targets = indices || [0, 1, 2, 3];
  const next = corners.map(p => ({ x: p.x, y: p.y }));
  let moved = 0;
  for (const index of targets) {
    const prevLine = lines[(index + 3) % 4];
    const nextLine = lines[index];
    if (!prevLine || !nextLine) continue;
    const point = imageEditorScreenIntersectLines(prevLine, nextLine);
    if (!point) continue;
    if (Math.hypot(point.x - corners[index].x, point.y - corners[index].y) > limit) continue;
    next[index] = point;
    moved++;
  }
  if (moved) {
    screen.corners = next;
    imageEditorScreenSchedule("fast");
    imageEditorScreenSchedule("full");
  }
  return moved;
}

// 截图通常比目标区域大，先按目标尺寸的 1.5 倍降采样，兼顾清晰度与采样速度
function imageEditorScreenPrepareShot() {
  const screen = imageEditorScreen();
  const source = screen.source;
  if (!source) { screen.image = null; screen.fitK = 0; return; }
  if (screen.corners.length !== 4) {
    if (screen.image && screen.fitK === -1) return;
    screen.fitK = -1;
    const ctx = source.getContext("2d", { willReadFrequently: true });
    screen.image = {
      canvas: source,
      data: ctx.getImageData(0, 0, source.width, source.height).data,
      width: source.width,
      height: source.height,
    };
    return;
  }
  const size = imageEditorScreenQuadSize(screen.corners);
  const k = Math.min(1, (size.width * 1.5) / source.width, (size.height * 1.5) / source.height);
  if (screen.image && screen.fitK > 0 && Math.abs(k - screen.fitK) < 0.08) return;
  let target = source;
  if (k < 0.98) {
    const scaled = document.createElement("canvas");
    scaled.width = Math.max(1, Math.round(source.width * k));
    scaled.height = Math.max(1, Math.round(source.height * k));
    const sctx = scaled.getContext("2d");
    sctx.imageSmoothingEnabled = true;
    sctx.imageSmoothingQuality = "high";
    sctx.drawImage(source, 0, 0, scaled.width, scaled.height);
    target = scaled;
  }
  screen.fitK = k;
  const ctx = target.getContext("2d", { willReadFrequently: true });
  screen.image = {
    canvas: target,
    data: ctx.getImageData(0, 0, target.width, target.height).data,
    width: target.width,
    height: target.height,
  };
}

function imageEditorScreenEnsureCanvases() {
  const screen = imageEditorScreen();
  const doc = imageEditorState.documentCanvas;
  if (!screen.fastCanvas) screen.fastCanvas = document.createElement("canvas");
  if (!screen.fullCanvas) screen.fullCanvas = document.createElement("canvas");
  const maxDim = Math.max(doc.width, doc.height);
  screen.previewScale = Math.min(1, IMAGE_EDITOR_SCREEN_PREVIEW_MAX / Math.max(1, maxDim));
  screen.fastCanvas.width = Math.max(1, Math.round(doc.width * screen.previewScale));
  screen.fastCanvas.height = Math.max(1, Math.round(doc.height * screen.previewScale));
  screen.fullCanvas.width = doc.width;
  screen.fullCanvas.height = doc.height;
}

// —— 拖动顶点时的实时预览 ——
// 全程走 GPU 的 drawImage：把截图切成网格，每个小格用两个仿射三角形贴过去。
// 这样拖动时既跟手、又保持底图的原分辨率，不会像低分辨率预览那样把画面糊掉；
// 松手后再用逐像素合成给出精确结果（羽化、光照、刘海都在那一步算准）。

function imageEditorScreenBlitTriangle(ctx, image, s0, s1, s2, d0, d1, d2) {
  const denom = (s1.x - s0.x) * (s2.y - s0.y) - (s2.x - s0.x) * (s1.y - s0.y);
  if (Math.abs(denom) < 1e-9) return;
  const a = ((d1.x - d0.x) * (s2.y - s0.y) - (d2.x - d0.x) * (s1.y - s0.y)) / denom;
  const b = ((d2.x - d0.x) * (s1.x - s0.x) - (d1.x - d0.x) * (s2.x - s0.x)) / denom;
  const c = ((d1.y - d0.y) * (s2.y - s0.y) - (d2.y - d0.y) * (s1.y - s0.y)) / denom;
  const d = ((d2.y - d0.y) * (s1.x - s0.x) - (d1.y - d0.y) * (s2.x - s0.x)) / denom;
  const e = d0.x - a * s0.x - b * s0.y;
  const f = d0.y - c * s0.x - d * s0.y;
  // 裁剪路径向外扩约 1px：相邻三角形的抗锯齿边会让出半透明缝，
  // 不扩就会看到网格纹路。纹理仍是按原顶点仿射，边缘只差 1px，看不出变形。
  const cx = (d0.x + d1.x + d2.x) / 3;
  const cy = (d0.y + d1.y + d2.y) / 3;
  const grow = (p) => {
    const dx = p.x - cx, dy = p.y - cy;
    const len = Math.hypot(dx, dy) || 1;
    return { x: p.x + dx / len * 1.15, y: p.y + dy / len * 1.15 };
  };
  const q0 = grow(d0), q1 = grow(d1), q2 = grow(d2);
  ctx.save();
  ctx.beginPath();
  ctx.moveTo(q0.x, q0.y);
  ctx.lineTo(q1.x, q1.y);
  ctx.lineTo(q2.x, q2.y);
  ctx.closePath();
  ctx.clip();
  ctx.transform(a, c, b, d, e, f);
  ctx.drawImage(image, 0, 0);
  ctx.restore();
}

function imageEditorScreenDrawMeshPreview(ctx, quad, shotCanvas, cols = 10, rows = 10) {
  const sw = shotCanvas.width, sh = shotCanvas.height;
  const H = imageEditorScreenHomography(
    [{ x: 0, y: 0 }, { x: sw, y: 0 }, { x: sw, y: sh }, { x: 0, y: sh }],
    quad
  );
  if (!H) return;
  const mapPoint = (u, v) => {
    const w = H[6] * u + H[7] * v + 1;
    return { x: (H[0] * u + H[1] * v + H[2]) / w, y: (H[3] * u + H[4] * v + H[5]) / w };
  };
  // 整块裁剪到屏幕四边形内：网格是分片近似的，边缘会有几像素外溢，
  // 贴着四角裁掉才不会看到贴图越出屏幕。
  ctx.save();
  ctx.beginPath();
  ctx.moveTo(quad[0].x, quad[0].y);
  for (let i = 1; i < 4; i++) ctx.lineTo(quad[i].x, quad[i].y);
  ctx.closePath();
  ctx.clip();
  for (let j = 0; j < rows; j++) {
    for (let i = 0; i < cols; i++) {
      const u0 = (i / cols) * sw, u1 = ((i + 1) / cols) * sw;
      const v0 = (j / rows) * sh, v1 = ((j + 1) / rows) * sh;
      const p00 = mapPoint(u0, v0), p10 = mapPoint(u1, v0);
      const p11 = mapPoint(u1, v1), p01 = mapPoint(u0, v1);
      imageEditorScreenBlitTriangle(ctx, shotCanvas,
        { x: u0, y: v0 }, { x: u1, y: v0 }, { x: u1, y: v1 }, p00, p10, p11);
      imageEditorScreenBlitTriangle(ctx, shotCanvas,
        { x: u0, y: v0 }, { x: u1, y: v1 }, { x: u0, y: v1 }, p00, p11, p01);
    }
  }
  ctx.restore();
}

// 用一条连续矢量路径把刘海原图还原。Canvas 统一处理底边和两侧圆角的
// 像素覆盖率，避免逐像素亮度判定造成灰边、断层或块状过渡。
function imageEditorScreenDrawNotchOverlay(ctx, doc, notch = imageEditorScreen().notch, scale = 1) {
  if (!notch) return;
  const up = notch.up;
  const perpX = -up.y, perpY = up.x;
  const oy = notch.origin.y * scale, ox = notch.origin.x * scale;
  const a0 = notch.coreA0 * scale;
  const nW = Math.max(1, (notch.coreA1 - notch.coreA0) * scale);
  const nH = Math.max(1, notch.b1 * scale);
  const nR = Math.min(notch.radius * scale, nW / 2, nH / 2);
  const at = (lx, ly) => ({
    x: ox + up.x * (a0 + lx) + perpX * ly,
    y: oy + up.y * (a0 + lx) + perpY * ly,
  });
  const p0 = at(0, 0), p1 = at(nW, 0), p2 = at(nW, nH - nR);
  const p3 = at(nW - nR, nH), p4 = at(nR, nH), p5 = at(0, nH - nR);
  ctx.save();
  ctx.beginPath();
  ctx.moveTo(p0.x, p0.y);
  ctx.lineTo(p1.x, p1.y);
  ctx.lineTo(p2.x, p2.y);
  const r1 = at(nW, nH);
  ctx.quadraticCurveTo(r1.x, r1.y, p3.x, p3.y);
  ctx.lineTo(p4.x, p4.y);
  const r2 = at(0, nH);
  ctx.quadraticCurveTo(r2.x, r2.y, p5.x, p5.y);
  ctx.closePath();
  ctx.clip();
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(doc, 0, 0);
  ctx.restore();
}

// 快速预览：底图 + 网格贴图 + 刘海还原，全部按原分辨率绘制。
function imageEditorScreenUpdateMeshPreview() {
  const screen = imageEditorScreen();
  if (!imageEditorState.hasImage || imageEditorState.mode !== "screen") return;
  imageEditorScreenEnsureCanvases();
  const doc = imageEditorState.documentCanvas;
  const canvas = screen.fullCanvas;
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(screen.baseCanvas || doc, 0, 0);
  if (screen.corners.length === 4 && screen.image && !screen.hideShot) {
    screen.notch = screen.params.notch && screen.corners.length === 4
      ? (screen.notch || imageEditorScreenDetectNotch(doc, screen.corners))
      : null;
    imageEditorScreenDrawMeshPreview(ctx, screen.corners, screen.image.canvas);
    if (screen.notch) imageEditorScreenDrawNotchOverlay(ctx, doc, screen.notch, 1);
  }
  screen.preview = canvas;
  renderImageEditorCanvas();
  imageEditorScreenSyncOverlay();
}

function imageEditorScreenUpdatePreview(quality) {
  const screen = imageEditorScreen();
  if (!imageEditorState.hasImage || imageEditorState.mode !== "screen") return;
  imageEditorScreenEnsureCanvases();
  const doc = imageEditorState.documentCanvas;
  const ready = screen.corners.length === 4 && screen.image && !screen.hideShot;
  screen.notch = null;
  if (screen.params.notch && screen.corners.length === 4) {
    screen.notch = imageEditorScreenDetectNotch(doc, screen.corners);
  }
  if (quality === "fast") {
    const canvas = screen.fastCanvas;
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(doc, 0, 0, canvas.width, canvas.height);
    if (ready) {
      const s = screen.previewScale;
      imageEditorScreenComposite(
        canvas,
        screen.corners.map(p => ({ x: p.x * s, y: p.y * s })),
        screen.image, screen.params, s, screen.notch
      );
    }
    screen.preview = canvas;
  } else {
    const canvas = screen.fullCanvas;
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(doc, 0, 0);
    if (ready) {
      imageEditorScreenComposite(canvas, screen.corners, screen.image, screen.params, 1, screen.notch);
    }
    screen.preview = canvas;
  }
  renderImageEditorCanvas();
  imageEditorScreenSyncOverlay();
}

function imageEditorScreenSchedule(quality) {
  const screen = imageEditorScreen();
  if (quality === "fast") {
    // 拖动中用网格预览：GPU 绘制、原分辨率，跟手且不糊。
    if (screen.rafPending) return;
    screen.rafPending = true;
    requestAnimationFrame(() => {
      screen.rafPending = false;
      imageEditorScreenUpdateMeshPreview();
    });
  } else {
    clearTimeout(screen.fullTimer);
    screen.fullTimer = setTimeout(() => imageEditorScreenUpdatePreview("full"), 90);
  }
}

let imageEditorScreenHandleNodes = null;

function imageEditorScreenSyncOverlay() {
  const screen = imageEditorScreen();
  const overlay = $("#imageEditorScreenOverlay");
  const actions = $("#imageEditorScreenOverlayActions");
  const active = imageEditorState.mode === "screen" && imageEditorState.hasImage;
  // SVG 元素上用 JS 给 hidden 赋值不会移除 HTML 的 hidden 属性，这里显式操作
  if (active) overlay.removeAttribute("hidden");
  else overlay.setAttribute("hidden", "");
  if (!active) {
    actions.hidden = true;
    return;
  }
  const stage = $("#imageEditorStage");
  const canvas = imageEditorCanvas();
  const stageRect = stage.getBoundingClientRect();
  const canvasRect = canvas.getBoundingClientRect();
  if (!canvasRect.width) return;
  overlay.style.left = `${canvasRect.left - stageRect.left + stage.scrollLeft}px`;
  overlay.style.top = `${canvasRect.top - stageRect.top + stage.scrollTop}px`;
  overlay.style.width = `${canvasRect.width}px`;
  overlay.style.height = `${canvasRect.height}px`;
  overlay.setAttribute("viewBox", `0 0 ${canvasRect.width} ${canvasRect.height}`);
  overlay.style.display = screen.hideOverlay ? "none" : "";

  const k = canvasRect.width / Math.max(1, canvas.width);
  const group = $("#imageEditorScreenHandles");
  if (!imageEditorScreenHandleNodes) {
    group.innerHTML = "";
    imageEditorScreenHandleNodes = [];
    for (let i = 0; i < 4; i++) {
      const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
      circle.setAttribute("r", "6");
      const text = document.createElementNS("http://www.w3.org/2000/svg", "text");
      group.appendChild(circle);
      group.appendChild(text);
      imageEditorScreenHandleNodes.push({ circle, text });
    }
  }
  const polygon = $("#imageEditorScreenPolygon");
  const count = screen.corners.length;
  polygon.style.display = count < 3 ? "none" : "";
  if (count >= 3) {
    polygon.setAttribute("points", screen.corners.map(p => `${(p.x * k).toFixed(2)},${(p.y * k).toFixed(2)}`).join(" "));
  }
  polygon.classList.toggle("is-complete", count === 4);
  imageEditorScreenHandleNodes.forEach((node, i) => {
    const show = i < count;
    node.circle.style.display = show ? "" : "none";
    node.text.style.display = show ? "" : "none";
    if (!show) return;
    const p = screen.corners[i];
    const cx = p.x * k, cy = p.y * k;
    node.circle.setAttribute("cx", cx.toFixed(2));
    node.circle.setAttribute("cy", cy.toFixed(2));
    node.circle.setAttribute("class", i === screen.activeCorner ? "is-active" : "");
    node.text.setAttribute("x", (cx + 9).toFixed(2));
    node.text.setAttribute("y", (cy - 8).toFixed(2));
    node.text.textContent = String(i + 1);
  });
  const ready = count === 4 && Boolean(screen.image) && !screen.hideOverlay;
  actions.hidden = !ready;
  if (ready) {
    const anchor = imageEditorCanvasPointToStage(screen.corners[2]);
    actions.style.left = `${anchor.x}px`;
    actions.style.top = `${anchor.y}px`;
  }
}

function imageEditorScreenMagnifierVisible() {
  return !$("#imageEditorScreenMagnifier").hidden;
}

// 放大镜贴合点位：把「画布坐标里的焦点」投影成舞台内坐标。
// 位置只由焦点与当前画布几何决定，所以画布缩放 / 滚动后重算就能贴回原处，
// 不会像直接用鼠标坐标那样在缩放后停在旧位置飘来飘去。
function imageEditorScreenPlaceMagnifier(center) {
  const screen = imageEditorScreen();
  const magnifier = $("#imageEditorScreenMagnifier");
  const stage = $("#imageEditorStage");
  const canvas = imageEditorCanvas();
  const stageRect = stage.getBoundingClientRect();
  const canvasRect = canvas.getBoundingClientRect();
  const stageX = canvasRect.left - stageRect.left + stage.scrollLeft +
    center.x * canvasRect.width / Math.max(1, canvas.width);
  const stageY = canvasRect.top - stageRect.top + stage.scrollTop +
    center.y * canvasRect.height / Math.max(1, canvas.height);
  const size = 170;
  let left = stageX + 26;
  let top = stageY - size - 26;
  if (left + size > Math.max(size, stage.scrollWidth) - 8) left = stageX - size - 26;
  if (top < stage.scrollTop + 8) top = stageY + 26;
  magnifier.style.left = `${Math.max(8, left)}px`;
  magnifier.style.top = `${top}px`;
  magnifier.hidden = false;

  const ctx = magnifier.querySelector("canvas").getContext("2d");
  const source = (!screen.hideShot && screen.preview) ? screen.preview : imageEditorState.documentCanvas;
  const zoom = 8;
  const side = size / zoom;
  let sx = center.x - side / 2;
  let sy = center.y - side / 2;
  let span = side;
  if (sx < 0) sx = 0;
  if (sy < 0) sy = 0;
  if (sx + span > source.width) sx = Math.max(0, source.width - span);
  if (sy + span > source.height) sy = Math.max(0, source.height - span);
  span = Math.min(span, source.width, source.height);

  ctx.imageSmoothingEnabled = false;
  ctx.clearRect(0, 0, size, size);
  ctx.drawImage(source, sx, sy, span, span, 0, 0, size, size);

  const px = imageEditorScreenClamp((center.x - sx) / span, 0, 1) * size;
  const py = imageEditorScreenClamp((center.y - sy) / span, 0, 1) * size;
  ctx.strokeStyle = "rgba(226, 42, 42, .95)";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(px + 0.5, 0); ctx.lineTo(px + 0.5, size);
  ctx.moveTo(0, py + 0.5); ctx.lineTo(size, py + 0.5);
  ctx.stroke();
  ctx.strokeStyle = "rgba(255, 255, 255, .8)";
  ctx.beginPath();
  ctx.moveTo(px + 1.5, 0); ctx.lineTo(px + 1.5, size);
  ctx.moveTo(0, py + 1.5); ctx.lineTo(size, py + 1.5);
  ctx.stroke();
}

// 放大镜跟随指针：定点阶段以光标位置为十字中心，调整角点阶段以该角点为中心。
// focus 省略时取当前选中的角点。
function imageEditorScreenShowMagnifier(event, focus = null) {
  const screen = imageEditorScreen();
  const center = focus || (screen.activeCorner >= 0 ? screen.corners[screen.activeCorner] : null);
  if (!center) {
    screen.magnifierFocus = null;
    $("#imageEditorScreenMagnifier").hidden = true;
    return;
  }
  screen.magnifierFocus = { x: center.x, y: center.y };
  imageEditorScreenPlaceMagnifier(screen.magnifierFocus);
}

// 画布缩放 / 滚动后重算位置；放大镜没显示时什么也不做。
function imageEditorScreenRefreshMagnifier() {
  const screen = imageEditorScreen();
  if (!screen.magnifierFocus) return;
  if ($("#imageEditorScreenMagnifier").hidden) return;
  imageEditorScreenPlaceMagnifier(screen.magnifierFocus);
}

function imageEditorScreenHideMagnifier() {
  imageEditorScreen().magnifierFocus = null;
  $("#imageEditorScreenMagnifier").hidden = true;
}

function imageEditorScreenHitCorner(event) {
  const screen = imageEditorScreen();
  if (screen.corners.length !== 4) return -1;
  const canvas = imageEditorCanvas();
  const rect = canvas.getBoundingClientRect();
  const k = rect.width / Math.max(1, canvas.width);
  let best = -1, bestDist = 14;
  screen.corners.forEach((p, i) => {
    const d = Math.hypot(p.x * k + rect.left - event.clientX, p.y * k + rect.top - event.clientY);
    if (d < bestDist) { bestDist = d; best = i; }
  });
  return best;
}

function imageEditorScreenResetCorners() {
  const screen = imageEditorScreen();
  screen.corners = [];
  screen.activeCorner = -1;
  screen.interaction = null;
  screen.baseData = null;
  imageEditorScreenPrepareShot();
  imageEditorScreenSyncOverlay();
  imageEditorScreenSchedule("full");
  imageEditorScreenHideMagnifier();
  pushImageEditorScreenHistory();
  updateImageEditorControls();
  imageEditorStatus("已清空四角，请依次点击屏幕的左上、右上、右下、左下角。");
}

function imageEditorScreenApply() {
  const screen = imageEditorScreen();
  if (!imageEditorState.hasImage || !screen.image || screen.corners.length !== 4) {
    imageEditorStatus("请先点好屏幕四角并导入要贴的截图。");
    return;
  }
  if (!screen.notch && screen.params.notch && screen.corners.length === 4) {
    screen.notch = imageEditorScreenDetectNotch(imageEditorState.documentCanvas, screen.corners);
  }
  const doc = imageEditorState.documentCanvas;
  // 留一份贴合前的底图：再次进入换屏时可以回到这个基准继续调整，
  // 而不是把已经贴好的画面再叠一次。
  if (!screen.baseCanvas) {
    const base = document.createElement("canvas");
    base.width = doc.width;
    base.height = doc.height;
    base.getContext("2d").drawImage(doc, 0, 0);
    screen.baseCanvas = base;
  }
  imageEditorScreenComposite(doc, screen.corners, screen.image, screen.params, 1, screen.notch);
  // 四角、截图和参数都保留下来，方便回来接着改；只结束当前交互。
  screen.activeCorner = -1;
  screen.interaction = null;
  pushImageEditorHistory();
  // 记住这次应用对应的历史位置：底图若被别的编辑改动过，historyIndex 会变化，
  // 就不能再拿旧四角继续合成。
  screen.appliedHistoryIndex = imageEditorState.historyIndex;
  setImageEditorMode("view");
  imageEditorStatus("已应用换屏。再次进入换屏可继续调整四角与参数，也可用 Ctrl/⌘ Z 撤销。");
}

function imageEditorScreenCancel() {
  const screen = imageEditorScreen();
  if (screen.baseCanvas && screen.appliedHistoryIndex === imageEditorState.historyIndex) {
    imageEditorState.documentCanvas = cloneCanvas(imageEditorState.history[imageEditorState.historyIndex]);
  }
  screen.activeCorner = -1;
  screen.interaction = null;
  setImageEditorMode("view");
  imageEditorStatus("已取消本次换屏调整。");
}

// 再次进入换屏模式：如果底图仍是上次贴合的结果，就回退到贴合前的基准继续编辑；
// 底图已被别的编辑改过（裁切等）则不能沿用旧四角，清空重来。
// 返回 true 表示已恢复可继续调整的状态。
function imageEditorScreenResumeEditing() {
  const screen = imageEditorScreen();
  const doc = imageEditorState.documentCanvas;
  const resumable = screen.baseCanvas &&
    screen.corners.length === 4 &&
    screen.image &&
    screen.appliedHistoryIndex === imageEditorState.historyIndex &&
    screen.baseCanvas.width === doc.width &&
    screen.baseCanvas.height === doc.height;
  if (resumable) {
    const ctx = doc.getContext("2d");
    ctx.clearRect(0, 0, doc.width, doc.height);
    ctx.drawImage(screen.baseCanvas, 0, 0);
    return true;
  }
  if (screen.baseCanvas) {
    screen.baseCanvas = null;
    screen.appliedHistoryIndex = null;
    screen.corners = [];
    screen.activeCorner = -1;
    screen.image = null;
    screen.source = null;
    screen.fitK = 0;
    screen.notch = null;
  }
  return false;
}

async function imageEditorScreenLoadFile(file) {
  if (!file) return;
  if (!imageEditorState.hasImage) {
    imageEditorStatus("请先导入底图，再导入要贴上去的截图。");
    return;
  }
  const screen = imageEditorScreen();
  const url = URL.createObjectURL(file);
  try {
    const image = await loadImageSource(url);
    const canvas = document.createElement("canvas");
    canvas.width = image.naturalWidth;
    canvas.height = image.naturalHeight;
    canvas.getContext("2d").drawImage(image, 0, 0);
    screen.source = canvas;
    screen.image = null;
    screen.fitK = 0;
    imageEditorScreenPrepareShot();
    imageEditorScreenSchedule("full");
    pushImageEditorScreenHistory();
    updateImageEditorControls();
    const pending = screen.corners.length === 4
      ? "按 Enter 或点击画布上的 ✓ 确认。"
      : "还需要先点完屏幕的四个角。";
    imageEditorStatus(`截图 ${canvas.width} × ${canvas.height}px 已载入。${pending}`);
  } finally {
    URL.revokeObjectURL(url);
  }
}

function imageEditorScreenStatusHint() {
  const screen = imageEditorScreen();
  if (screen.corners.length < 4) {
    const labels = ["左上", "右上", "右下", "左下"];
    return `换屏：点击屏幕的${labels[screen.corners.length]}角（第 ${screen.corners.length + 1} / 4 个）。点的时候有 8 倍放大镜跟随。`;
  }
  if (!screen.image) return "换屏：四个角已就位，现在导入要贴上去的截图。";
  return "换屏：拖动角点微调，或在右侧调节参数；按 Enter 或点击 ✓ 确认，× 取消。";
}

// —— 换屏：指针交互 ——

function imageEditorScreenPointerDown(event, point) {
  const screen = imageEditorScreen();
  const stage = $("#imageEditorStage");
  if (screen.corners.length < 4) {
    screen.corners.push(point);
    // 定点过程也要有放大镜：十字中心就是刚点的位置，方便下一角对齐。
    imageEditorScreenShowMagnifier(event, point);
    if (screen.corners.length === 4) {
      imageEditorScreenNormalizeCorners();
      imageEditorScreenPrepareShot();
      imageEditorScreenSchedule("full");
      imageEditorStatus("四个角已确定。可以拖动角点微调，或导入要贴的截图。");
    } else {
      imageEditorScreenSyncOverlay();
      imageEditorStatus(imageEditorScreenStatusHint());
    }
    pushImageEditorScreenHistory();
    updateImageEditorControls();
    event.preventDefault();
    return;
  }
  const corner = imageEditorScreenHitCorner(event);
  if (corner >= 0) {
    screen.activeCorner = corner;
    screen.interaction = {
      type: "corner",
      index: corner,
      origin: screen.corners.map(p => ({ x: p.x, y: p.y })),
    };
    stage.style.cursor = "grabbing";
    imageEditorScreenSyncOverlay();
    imageEditorScreenShowMagnifier(event);
    event.preventDefault();
    return;
  }
  if (imageEditorScreenPointInQuad(point, screen.corners)) {
    screen.activeCorner = -1;
    screen.interaction = {
      type: "move",
      origin: screen.corners.map(p => ({ x: p.x, y: p.y })),
      start: point,
    };
    stage.style.cursor = "move";
    imageEditorScreenSyncOverlay();
    event.preventDefault();
  }
}

function imageEditorScreenPointerMove(event, point) {
  const screen = imageEditorScreen();
  const stage = $("#imageEditorStage");
  if (!screen.interaction) {
    if (screen.corners.length < 4) {
      stage.style.cursor = "crosshair";
      // 定点阶段放大镜跟着光标走，方便像素级对准屏幕边缘。
      imageEditorScreenShowMagnifier(event, point);
      return;
    }
    if (imageEditorScreenMagnifierVisible()) imageEditorScreenHideMagnifier();
    const corner = imageEditorScreenHitCorner(event);
    stage.style.cursor = corner >= 0
      ? "grab"
      : (imageEditorScreenPointInQuad(point, screen.corners) ? "move" : "crosshair");
    // 悬停到角点上也显示放大镜：和定点阶段一样，方便看清边缘再下手。
    if (corner >= 0) imageEditorScreenShowMagnifier(event, screen.corners[corner]);
    return;
  }
  if (screen.interaction.type === "corner") {
    screen.corners[screen.interaction.index] = point;
  } else {
    const dx = point.x - screen.interaction.start.x;
    const dy = point.y - screen.interaction.start.y;
    screen.corners = screen.interaction.origin.map(p => ({ x: p.x + dx, y: p.y + dy }));
  }
  // 拖动中走网格实时预览：底图保持原分辨率，只有顶点和贴图跟着动。
  imageEditorScreenSchedule("fast");
  if (screen.interaction.type === "corner") imageEditorScreenShowMagnifier(event);
  event.preventDefault();
}

function imageEditorScreenPointerUp() {
  const screen = imageEditorScreen();
  if (!screen.interaction) return;
  const wasCorner = screen.interaction.type === "corner";
  const index = screen.interaction.index;
  screen.interaction = null;
  $("#imageEditorStage").style.cursor = "";
  imageEditorScreenHideMagnifier();
  if (wasCorner && screen.autoSnap) {
    const moved = imageEditorScreenRefine([index], 10);
    if (moved) imageEditorStatus("已按边缘梯度把角点吸附到最近的边框上。");
  }
  imageEditorScreenSchedule("full");
  pushImageEditorScreenHistory();
  updateImageEditorControls();
}

function imageEditorScreenHandleKey(event) {
  const screen = imageEditorScreen();
  if (screen.activeCorner < 0 || screen.corners.length !== 4) return;
  const step = event.shiftKey ? 10 : 1;
  let dx = 0, dy = 0;
  if (event.key === "ArrowLeft") dx = -step;
  else if (event.key === "ArrowRight") dx = step;
  else if (event.key === "ArrowUp") dy = -step;
  else if (event.key === "ArrowDown") dy = step;
  else return;
  event.preventDefault();
  screen.corners[screen.activeCorner].x += dx;
  screen.corners[screen.activeCorner].y += dy;
  imageEditorScreenSchedule("fast");
  imageEditorScreenSchedule("full");
  pushImageEditorScreenHistory();
}

// —— 换屏：交互（下接 setImageEditorMode）——
function imageEditorScreenModeMarker() {}

function setImageEditorMode(mode) {
  if (!imageEditorState.hasImage) return;
  $("#imageEditorMoreMenu").hidden = true;
  $("#imageEditorMoreButton").setAttribute("aria-expanded", "false");
  imageEditorState.mode = mode;
  imageEditorState.selection = mode === "crop"
    ? {
      x: 0,
      y: 0,
      width: imageEditorState.documentCanvas.width,
      height: imageEditorState.documentCanvas.height,
    }
    : null;
  imageEditorState.interaction = null;
  imageEditorState.gradient = null;
  imageEditorState.snapGuides = emptySnapGuides();
  $("#imageEditorStage").style.cursor = mode === "inpaint" ? "none" : "";
  if (mode !== "inpaint") hideImageEditorInpaintCursor();
  let screenResumed = false;
  if (mode === "screen") {
    const screen = imageEditorScreen();
    screen.interaction = null;
    screen.activeCorner = -1;
    // 上次应用过贴合且底图没被别的编辑改过：回到基准继续调整。
    screenResumed = imageEditorScreenResumeEditing();
    imageEditorScreenPrepareShot();
    imageEditorScreenUpdatePreview("full");
    if (!screen.editHistory.length || screenResumed) {
      screen.editHistory = [];
      screen.editHistoryIndex = -1;
      pushImageEditorScreenHistory();
    }
  } else {
    imageEditorScreenHideMagnifier();
    renderImageEditorCanvas();
  }
  updateImageEditorControls();
  const message = mode === "remove"
    ? "区段删除：框选后拖动短边可斜切删除区域；接近矩形时会自动吸附。"
    : mode === "crop"
      ? "画布裁切：拖动画出要保留的画面范围，再点击“应用所选区域”。"
      : mode === "inpaint"
        ? "局部修复：按住拖动即可用周围像素自动填充修复圆形区域内的内容，修复半径可在右侧扩展区调节。"
        : mode === "cover"
          ? "智能覆盖：拖动画出方形或圆形区域，点击 ✓ 确认后自动填充颜色遮盖原有内容。"
          : mode === "split"
          ? "线条分隔：导入图 B，然后调节分隔线位置、角度和样式。"
        : mode === "blend"
            ? "图片融合：导入图 B，然后调节交汇位置、角度和融合宽度。"
          : mode === "gradient"
            ? "渐变：从全透明的起点拖向完全不透明的终点；按住 Shift 可吸附到 45° 倍数角度。"
        : mode === "screen"
          ? imageEditorScreenStatusHint()
        : "查看模式：按 C 可快速进入画布裁切。";
  imageEditorStatus(screenResumed ? "已回到上次的贴合状态，可以继续调整四角与参数。" : message);
  $("#imageEditorStage").focus();
}

function imageEditorPointerPosition(event) {
  const canvas = imageEditorCanvas();
  const rect = canvas.getBoundingClientRect();
  return {
    x: (event.clientX - rect.left) * canvas.width / rect.width,
    y: (event.clientY - rect.top) * canvas.height / rect.height,
  };
}

function normalizedEditorSelection(start, end) {
  const left = Math.min(start.x, end.x);
  const top = Math.min(start.y, end.y);
  return {
    x: left,
    y: top,
    width: Math.max(0, Math.max(start.x, end.x) - left),
    height: Math.max(0, Math.max(start.y, end.y) - top),
  };
}

function selectionFromPoints(start, end, square = false) {
  if (!square) return normalizedEditorSelection(start, end);
  const dx = end.x - start.x;
  const dy = end.y - start.y;
  const size = Math.max(Math.abs(dx), Math.abs(dy));
  return normalizedEditorSelection(start, {
    x: start.x + (dx < 0 ? -size : size),
    y: start.y + (dy < 0 ? -size : size),
  });
}

function resizeBoundsWithModifiers(original, handle, point, {
  minWidth = 2,
  minHeight = 2,
  preserveAspect = false,
  centered = false,
} = {}) {
  const originalRight = original.x + original.width;
  const originalBottom = original.y + original.height;
  const centerX = original.x + original.width / 2;
  const centerY = original.y + original.height / 2;
  const aspect = Math.max(0.0001, original.width / Math.max(0.0001, original.height));
  const keepAspect = preserveAspect || centered;

  if (!keepAspect) {
    let left = original.x;
    let top = original.y;
    let right = originalRight;
    let bottom = originalBottom;
    if (handle.includes("w")) left = Math.min(point.x, right - minWidth);
    if (handle.includes("e")) right = Math.max(point.x, left + minWidth);
    if (handle.includes("n")) top = Math.min(point.y, bottom - minHeight);
    if (handle.includes("s")) bottom = Math.max(point.y, top + minHeight);
    return { x: left, y: top, width: right - left, height: bottom - top };
  }

  let scale;
  if (centered) {
    const scaleX = handle.includes("w") || handle.includes("e")
      ? Math.abs(point.x - centerX) / Math.max(1, original.width / 2)
      : 0;
    const scaleY = handle.includes("n") || handle.includes("s")
      ? Math.abs(point.y - centerY) / Math.max(1, original.height / 2)
      : 0;
    scale = Math.max(scaleX, scaleY);
  } else {
    const anchorX = handle.includes("w") ? originalRight : original.x;
    const anchorY = handle.includes("n") ? originalBottom : original.y;
    const scaleX = handle.includes("w") || handle.includes("e")
      ? Math.abs(point.x - anchorX) / Math.max(1, original.width)
      : 0;
    const scaleY = handle.includes("n") || handle.includes("s")
      ? Math.abs(point.y - anchorY) / Math.max(1, original.height)
      : 0;
    scale = (scaleX && scaleY) ? Math.max(scaleX, scaleY) : (scaleX || scaleY);
  }
  const minimumScale = Math.max(minWidth / original.width, minHeight / original.height);
  scale = Math.max(minimumScale, scale || minimumScale);
  const width = original.width * scale;
  const height = width / aspect;

  if (centered) {
    return {
      x: centerX - width / 2,
      y: centerY - height / 2,
      width,
      height,
    };
  }

  let x;
  let y;
  if (handle.includes("w")) x = originalRight - width;
  else if (handle.includes("e")) x = original.x;
  else x = centerX - width / 2;
  if (handle.includes("n")) y = originalBottom - height;
  else if (handle.includes("s")) y = original.y;
  else y = centerY - height / 2;
  return { x, y, width, height };
}

function imageEditorPointerDown(event) {
  if (!imageEditorState.hasImage || event.button > 0) return;
  if (event.target.closest(".image-editor-selection-actions")) return;
  if (imageEditorState.mode === "screen") {
    imageEditorScreenPointerDown(event, imageEditorPointerPosition(event));
    return;
  }
  imageEditorState.snapGuides = emptySnapGuides();
  const point = imageEditorPointerPosition(event);
  if (imageEditorState.mode === "gradient") {
    const gradientHandle = event.target.closest("[data-gradient-handle]")?.dataset.gradientHandle;
    if (gradientHandle && imageEditorState.gradient) {
      imageEditorState.interaction = { mode: "gradient-adjust", handle: gradientHandle };
    } else if (imageEditorState.gradient) {
      return;
    } else {
      imageEditorState.gradient = { start: point, end: point };
      imageEditorState.interaction = { mode: "gradient" };
    }
  } else if (imageEditorState.mode === "inpaint") {
    const radius = Math.max(1, imageEditorState.inpaintSize / 2 / Math.max(0.01, imageEditorState.zoom));
    previewInpaintCircle(point.x, point.y);
    imageEditorState.interaction = {
      mode: "inpaint-stroke",
      lastPoint: point,
      strokes: [{ x: point.x, y: point.y, r: radius }],
    };
  } else if (["remove", "crop", "cover"].includes(imageEditorState.mode)) {
    const handle = event.target.closest("[data-selection-handle]")?.dataset.selectionHandle;
    if (handle && imageEditorState.selection) {
      const horizontalRemoval = imageEditorState.mode === "remove" &&
        imageEditorRemovalIsHorizontal(imageEditorState.selection);
      const shearHandle = imageEditorState.mode === "remove" && (
        (horizontalRemoval && ["e", "w"].includes(handle)) ||
        (!horizontalRemoval && ["n", "s"].includes(handle))
      );
      imageEditorState.interaction = {
        mode: shearHandle ? "shear" : "adjust",
        handle,
        start: point,
        original: { ...imageEditorState.selection },
        snappedToRectangle: false,
      };
    } else if (imageEditorState.selection) {
      if (!pointInImageEditorSelection(imageEditorState.selection, point)) {
        cancelImageEditorSelection();
        $("#imageEditorStage").focus();
        event.preventDefault();
        return;
      }
      imageEditorState.interaction = {
        mode: "move-selection",
        start: point,
        original: { ...imageEditorState.selection },
      };
    } else {
      const snapped = snapImageEditorPoint(point);
      imageEditorState.snapGuides = snapped.guides;
      imageEditorState.interaction = {
        mode: "create",
        start: snapped.point,
        baseGuides: snapped.guides,
      };
      imageEditorState.selection = normalizedEditorSelection(snapped.point, snapped.point);
    }
  } else {
    return;
  }
  $("#imageEditorStage").setPointerCapture?.(event.pointerId);
  $("#imageEditorStage").focus();
  renderImageEditorCanvas();
  updateImageEditorControls();
  event.preventDefault();
}

function snapGradientPoint(anchor, point, shiftKey) {
  if (!shiftKey) return point;
  const dx = point.x - anchor.x;
  const dy = point.y - anchor.y;
  const length = Math.hypot(dx, dy);
  if (length < 0.001) return point;
  const step = Math.PI / 4;
  const angle = Math.round(Math.atan2(dy, dx) / step) * step;
  return {
    x: anchor.x + Math.cos(angle) * length,
    y: anchor.y + Math.sin(angle) * length,
  };
}

function resizeImageEditorSelection(interaction, point, event) {
  const axes = (interaction.handle === "n" || interaction.handle === "s")
    ? "y"
    : (interaction.handle === "e" || interaction.handle === "w")
      ? "x"
      : "both";
  const snapped = snapImageEditorPoint(point, axes);
  point = snapped.point;
  imageEditorState.snapGuides = snapped.guides;
  return {
    ...resizeBoundsWithModifiers(interaction.original, interaction.handle, point, {
    preserveAspect: event.shiftKey,
    centered: event.altKey || event.ctrlKey,
    }),
    skew: Number(interaction.original.skew) || 0,
  };
}

function shearImageEditorSelection(interaction, point) {
  const original = interaction.original;
  const horizontal = imageEditorRemovalIsHorizontal(original);
  const canvas = imageEditorCanvas();
  const rect = canvas.getBoundingClientRect();
  const tolerance = horizontal
    ? 10 * canvas.height / Math.max(1, rect.height)
    : 10 * canvas.width / Math.max(1, rect.width);
  const delta = horizontal ? point.y - interaction.start.y : point.x - interaction.start.x;
  let selection = { ...original };
  if (horizontal) {
    if (interaction.handle === "e") {
      selection.skew = (Number(original.skew) || 0) + delta;
    } else {
      selection.y = original.y + delta;
      selection.skew = (Number(original.skew) || 0) - delta;
    }
  } else if (interaction.handle === "s") {
    selection.skew = (Number(original.skew) || 0) + delta;
  } else {
    selection.x = original.x + delta;
    selection.skew = (Number(original.skew) || 0) - delta;
  }
  interaction.snappedToRectangle = Math.abs(selection.skew) <= tolerance;
  if (interaction.snappedToRectangle) selection.skew = 0;
  return selection;
}

function imageEditorPointerMove(event) {
  updateImageEditorInpaintCursor(event.clientX, event.clientY);
  if (imageEditorState.mode === "screen") {
    imageEditorScreenPointerMove(event, imageEditorPointerPosition(event));
    return;
  }
  if (!imageEditorState.interaction) {
    const selection = imageEditorState.selection;
    if (selection && ["remove", "crop", "cover"].includes(imageEditorState.mode)) {
      const point = imageEditorPointerPosition(event);
      const inside = pointInImageEditorSelection(selection, point);
      $("#imageEditorStage").style.cursor = inside ? "move" : "";
    } else if (imageEditorState.mode === "inpaint") {
      $("#imageEditorStage").style.cursor = "none";
    }
    return;
  }
  const point = imageEditorPointerPosition(event);
  const interaction = imageEditorState.interaction;
  if (interaction.mode === "inpaint-stroke") {
    inpaintImageEditorSegment(interaction.lastPoint, point, interaction.strokes);
    interaction.lastPoint = point;
    renderImageEditorCanvas();
    event.preventDefault();
    return;
  }
  if (interaction.mode === "gradient") {
    imageEditorState.gradient.end = snapGradientPoint(
      imageEditorState.gradient.start,
      point,
      event.shiftKey
    );
  } else if (interaction.mode === "gradient-adjust") {
    const moving = interaction.handle;
    const anchor = moving === "start"
      ? imageEditorState.gradient.end
      : imageEditorState.gradient.start;
    imageEditorState.gradient[moving] = snapGradientPoint(anchor, point, event.shiftKey);
  } else if (interaction.mode === "create") {
    const snapped = snapImageEditorPoint(point);
    imageEditorState.snapGuides = {
      vertical: [...new Set([
        ...interaction.baseGuides.vertical,
        ...snapped.guides.vertical,
      ])],
      horizontal: [...new Set([
        ...interaction.baseGuides.horizontal,
        ...snapped.guides.horizontal,
      ])],
    };
    imageEditorState.selection = selectionFromPoints(interaction.start, snapped.point, event.shiftKey);
  } else if (interaction.mode === "move-selection") {
    const moved = {
      ...interaction.original,
      x: interaction.original.x + point.x - interaction.start.x,
      y: interaction.original.y + point.y - interaction.start.y,
    };
    const canvas = imageEditorCanvas();
    const frame = selectionFrameBounds(canvas, moved);
    const snapped = snapBoundsToCanvas(frame, canvas, 10, true);
    imageEditorState.selection = {
      ...moved,
      x: moved.x + snapped.x - frame.x,
      y: moved.y + snapped.y - frame.y,
    };
    imageEditorState.snapGuides = snapped.guides;
  } else if (interaction.mode === "shear") {
    imageEditorState.selection = shearImageEditorSelection(interaction, point);
    imageEditorState.snapGuides = emptySnapGuides();
  } else {
    imageEditorState.selection = resizeImageEditorSelection(interaction, point, event);
  }
  renderImageEditorCanvas();
  updateImageEditorControls();
  event.preventDefault();
}

function imageEditorPointerUp(event) {
  if (imageEditorState.mode === "screen") {
    imageEditorScreenPointerUp();
    return;
  }
  if (!imageEditorState.interaction) return;
  const interaction = imageEditorState.interaction;
  imageEditorState.interaction = null;
  $("#imageEditorStage").releasePointerCapture?.(event.pointerId);
  if (interaction.mode === "inpaint-stroke") {
    if (interaction.strokes?.length) {
      inpaintImageEditorRegion(interaction.strokes);
    }
    pushImageEditorHistory();
    renderImageEditorCanvas();
    updateImageEditorControls();
    imageEditorStatus(`已完成局部修复 · 半径 ${imageEditorState.inpaintSize}px，颜色已按周边画面自然填充，可用撤销恢复。`);
    event.preventDefault();
    return;
  }
  if (interaction.mode === "gradient" || interaction.mode === "gradient-adjust") {
    const gradient = imageEditorState.gradient;
    if (!gradient || Math.hypot(gradient.end.x - gradient.start.x, gradient.end.y - gradient.start.y) < 3) {
      imageEditorState.gradient = null;
      renderImageEditorCanvas();
      updateImageEditorControls();
      return;
    }
    imageEditorStatus("渐变辅助线已完成：起点全透明，终点完全不透明。");
    syncImageEditorOverlays();
    return;
  }
  const snapped = imageEditorState.snapGuides.vertical.length || imageEditorState.snapGuides.horizontal.length;
  const snappedToRectangle = interaction.mode === "shear" && interaction.snappedToRectangle;
  imageEditorState.snapGuides = emptySnapGuides();
  const selection = imageEditorState.selection;
  if (!selection || selection.width < 2 || selection.height < 2) {
    imageEditorState.selection = null;
    renderImageEditorCanvas();
    updateImageEditorControls();
    return;
  }
  const effective = imageEditorState.mode === "remove" ? intersectImageEditorSelection(selection) : selection;
  if (!effective) {
    imageEditorStatus("选区没有与图像重叠，请拖动边缘或四角重新调整。");
    syncImageEditorOverlays();
    return;
  }
  const dimensions = `${Math.round(effective.width)} × ${Math.round(effective.height)}px`;
  const direction = imageEditorState.mode === "remove"
    ? (imageEditorRemovalIsHorizontal(selection)
      ? "上下拼合"
      : "左右拼合")
    : "";
  imageEditorStatus(
    imageEditorState.mode === "remove"
      ? `有效删除区域 ${dimensions} · 将自动${direction}${snapped ? " · 已吸附到边缘" : ""}${snappedToRectangle ? " · 已吸附回矩形" : ""}。`
      : `已框选保留区域 ${dimensions}${snapped ? " · 已吸附到边缘" : ""}。`
  );
  renderImageEditorCanvas();
}

function cancelImageEditorSelection() {
  imageEditorState.selection = null;
  imageEditorState.interaction = null;
  imageEditorState.snapGuides = emptySnapGuides();
  renderImageEditorCanvas();
  updateImageEditorControls();
  imageEditorStatus("已取消当前框选。");
}

function applyShearedImageEditorRemoval(source, selection, horizontal) {
  const result = document.createElement("canvas");
  const skew = Number(selection.skew) || 0;
  if (horizontal) {
    const removed = Math.max(2, Math.min(source.height - 1, Math.round(selection.height)));
    result.width = source.width;
    result.height = source.height - removed;
    const out = result.getContext("2d");
    for (let x = 0; x < source.width; x++) {
      const progress = (x - selection.x) / Math.max(1, selection.width);
      const start = Math.max(0, Math.min(source.height - removed, Math.round(selection.y + skew * progress)));
      if (start > 0) out.drawImage(source, x, 0, 1, start, x, 0, 1, start);
      const bottom = source.height - start - removed;
      if (bottom > 0) {
        out.drawImage(source, x, start + removed, 1, bottom, x, start, 1, bottom);
      }
    }
    return result;
  }
  const removed = Math.max(2, Math.min(source.width - 1, Math.round(selection.width)));
  result.width = source.width - removed;
  result.height = source.height;
  const out = result.getContext("2d");
  for (let y = 0; y < source.height; y++) {
    const progress = (y - selection.y) / Math.max(1, selection.height);
    const start = Math.max(0, Math.min(source.width - removed, Math.round(selection.x + skew * progress)));
    if (start > 0) out.drawImage(source, 0, y, start, 1, 0, y, start, 1);
    const right = source.width - start - removed;
    if (right > 0) {
      out.drawImage(source, start + removed, y, right, 1, start, y, right, 1);
    }
  }
  return result;
}

function applyImageEditorSelection() {
  const selection = imageEditorState.selection;
  const source = imageEditorState.documentCanvas;
  if (!selection || !imageEditorState.hasImage) return;
  if (imageEditorState.mode === "cover") {
    const overlap = intersectImageEditorSelection(selection);
    if (!overlap) return;
    const filled = applyCoverFill(overlap);
    if (!filled) return;
    imageEditorState.selection = null;
    pushImageEditorHistory();
    renderImageEditorCanvas();
    updateImageEditorControls();
    imageEditorStatus(
      `智能覆盖完成 · ${imageEditorState.coverShape === "ellipse" ? "圆形" : "方形"}区域已按周边画面自动填充，可用撤销恢复。`
    );
    return;
  }
  let result = document.createElement("canvas");
  if (imageEditorState.mode === "crop") {
    const x = Math.round(selection.x);
    const y = Math.round(selection.y);
    const width = Math.round(selection.width);
    const height = Math.round(selection.height);
    if (width < 2 || height < 2) return;
    result.width = width;
    result.height = height;
    result.getContext("2d").drawImage(source, -x, -y);
  } else {
    const overlap = intersectImageEditorSelection(selection);
    if (!overlap) return;
    const x = Math.round(overlap.x);
    const y = Math.round(overlap.y);
    const width = Math.round(overlap.width);
    const height = Math.round(overlap.height);
    const horizontal = imageEditorRemovalIsHorizontal(selection);
    if (Math.abs(Number(selection.skew) || 0) >= 0.5) {
      result = applyShearedImageEditorRemoval(source, selection, imageEditorRemovalIsHorizontal(selection));
    } else if (horizontal) {
      if (height < 2 || height >= source.height) return;
      result.width = source.width;
      result.height = source.height - height;
      const out = result.getContext("2d");
      if (y > 0) out.drawImage(source, 0, 0, source.width, y, 0, 0, source.width, y);
      const bottomHeight = source.height - y - height;
      if (bottomHeight > 0) {
        out.drawImage(source, 0, y + height, source.width, bottomHeight, 0, y, source.width, bottomHeight);
      }
    } else {
      if (width < 2 || width >= source.width) return;
      result.width = source.width - width;
      result.height = source.height;
      const out = result.getContext("2d");
      if (x > 0) out.drawImage(source, 0, 0, x, source.height, 0, 0, x, source.height);
      const rightWidth = source.width - x - width;
      if (rightWidth > 0) {
        out.drawImage(source, x + width, 0, rightWidth, source.height, x, 0, rightWidth, source.height);
      }
    }
  }
  imageEditorState.documentCanvas = result;
  imageEditorState.selection = null;
  pushImageEditorHistory();
  renderImageEditorCanvas();
  resetImageEditorZoom();
  updateImageEditorControls();
  imageEditorStatus(
    `${imageEditorState.mode === "crop" ? "画布裁切" : "区段删除拼合"}完成 · 当前 ${result.width} × ${result.height}px`
  );
}

function cancelImageEditorGradient() {
  imageEditorState.gradient = null;
  imageEditorState.interaction = null;
  imageEditorState.snapGuides = emptySnapGuides();
  renderImageEditorCanvas();
  updateImageEditorControls();
  imageEditorStatus("已取消透明度渐变。");
}

function applyImageEditorGradient() {
  if (!imageEditorState.gradient || !imageEditorState.hasImage) return;
  const source = imageEditorState.documentCanvas;
  const result = cloneCanvas(source);
  drawImageEditorGradient(result.getContext("2d"), result.width, result.height);
  imageEditorState.documentCanvas = result;
  imageEditorState.gradient = null;
  imageEditorState.mode = "view";
  pushImageEditorHistory();
  renderImageEditorCanvas();
  updateImageEditorControls();
  imageEditorStatus(`渐变透明已应用 · 当前 ${result.width} × ${result.height}px PNG 画布`);
}

function restoreImageEditorHistory(index) {
  if (index < 0 || index >= imageEditorState.history.length) return;
  imageEditorState.historyIndex = index;
  imageEditorState.documentCanvas = cloneCanvas(imageEditorState.history[index]);
  imageEditorState.selection = null;
  imageEditorState.gradient = null;
  renderImageEditorCanvas();
  // 撤销只回放编辑内容：缩放与画面位置属于视图操作，保持用户当前的视野。
  resetImageEditorZoom(imageEditorState.zoom, { preserveView: true });
  updateImageEditorControls();
  imageEditorStatus(`已恢复到历史步骤 ${index + 1} · 当前 ${imageEditorState.documentCanvas.width} × ${imageEditorState.documentCanvas.height}px`);
}

function exportImageEditorImage() {
  if (!imageEditorState.hasImage) return;
  let exportCanvas = imageEditorState.documentCanvas;
  const screen = imageEditorScreen();
  if (imageEditorState.mode === "screen" && screen.image && screen.corners.length === 4 && !screen.hideShot) {
    clearTimeout(screen.fullTimer);
    imageEditorScreenUpdatePreview("full");
    exportCanvas = screen.fullCanvas;
  }
  exportCanvas.toBlob(blob => {
    if (!blob) return;
    const baseName = imageEditorState.sourceName.replace(/\.[^.]+$/, "") || "image";
    downloadBlob(blob, `${baseName}-编辑.png`);
    imageEditorStatus(`已导出 ${exportCanvas.width} × ${exportCanvas.height}px PNG`);
  }, "image/png");
}

async function loadImageEditorSecondFile(file) {
  if (!file) return;
  const url = URL.createObjectURL(file);
  try {
    imageEditorState.secondImage = await loadImageSource(url);
    renderImageEditorCanvas();
    updateImageEditorControls();
    imageEditorStatus(`已导入图 B：${file.name}`);
  } finally {
    URL.revokeObjectURL(url);
  }
}

function applyImageEditorComposite() {
  if (!imageEditorState.secondImage || !["split", "blend"].includes(imageEditorState.mode)) return;
  const compositeMode = imageEditorState.mode;
  const result = document.createElement("canvas");
  result.width = imageEditorState.documentCanvas.width;
  result.height = imageEditorState.documentCanvas.height;
  drawImageEditorComposite(result.getContext("2d"), result.width, result.height, false);
  if (compositeMode === "split") drawImageEditorDivider(result.getContext("2d"), result.width, result.height);
  imageEditorState.documentCanvas = result;
  imageEditorState.secondImage = null;
  imageEditorState.mode = "view";
  pushImageEditorHistory();
  renderImageEditorCanvas();
  updateImageEditorControls();
  imageEditorStatus(`图片${compositeMode === "blend" ? "融合" : "分隔拼接"}完成 · ${result.width} × ${result.height}px`);
}

function suggestImageEditorWindow() {
  if (!imageEditorState.hasImage) return;
  $("#imageEditorMoreMenu").hidden = true;
  $("#imageEditorMoreButton").setAttribute("aria-expanded", "false");
  const source = imageEditorState.documentCanvas;
  const maxSide = 520;
  const scale = Math.min(1, maxSide / Math.max(source.width, source.height));
  const sample = document.createElement("canvas");
  sample.width = Math.max(2, Math.round(source.width * scale));
  sample.height = Math.max(2, Math.round(source.height * scale));
  const ctx = sample.getContext("2d", { willReadFrequently: true });
  ctx.drawImage(source, 0, 0, sample.width, sample.height);
  const data = ctx.getImageData(0, 0, sample.width, sample.height).data;
  const gray = (x, y) => {
    const i = (y * sample.width + x) * 4;
    return data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114;
  };
  const vertical = new Array(sample.width).fill(0);
  const horizontal = new Array(sample.height).fill(0);
  for (let y = 1; y < sample.height - 1; y++) {
    for (let x = 1; x < sample.width - 1; x++) {
      vertical[x] += Math.abs(gray(x + 1, y) - gray(x - 1, y));
      horizontal[y] += Math.abs(gray(x, y + 1) - gray(x, y - 1));
    }
  }
  const strongest = (values, start, end) => {
    let best = start;
    for (let i = start + 1; i < end; i++) if (values[i] > values[best]) best = i;
    return best;
  };
  const left = strongest(vertical, Math.round(sample.width * 0.05), Math.round(sample.width * 0.48));
  const right = strongest(vertical, Math.round(sample.width * 0.52), Math.round(sample.width * 0.95));
  const top = strongest(horizontal, Math.round(sample.height * 0.05), Math.round(sample.height * 0.48));
  const bottom = strongest(horizontal, Math.round(sample.height * 0.52), Math.round(sample.height * 0.95));
  const inset = 2 / scale;
  imageEditorState.mode = "crop";
  imageEditorState.selection = {
    x: left / scale + inset,
    y: top / scale + inset,
    width: Math.max(2, (right - left) / scale - inset * 2),
    height: Math.max(2, (bottom - top) / scale - inset * 2),
  };
  renderImageEditorCanvas();
  updateImageEditorControls();
  imageEditorStatus("已生成窗口内边候选框；请拖动四边精修，确认后再应用裁切。");
}

function setImageEditorZoomAtPoint(nextZoom, clientX, clientY) {
  const stage = $("#imageEditorStage");
  const canvas = imageEditorCanvas();
  const rect = canvas.getBoundingClientRect();
  const ratioX = rect.width ? Math.max(0, Math.min(1, (clientX - rect.left) / rect.width)) : 0.5;
  const ratioY = rect.height ? Math.max(0, Math.min(1, (clientY - rect.top) / rect.height)) : 0.5;
  const beforeWidth = rect.width;
  const beforeHeight = rect.height;
  applyImageEditorZoom(nextZoom);
  stage.scrollLeft += ratioX * (canvas.getBoundingClientRect().width - beforeWidth);
  stage.scrollTop += ratioY * (canvas.getBoundingClientRect().height - beforeHeight);
  imageEditorStatus(`画布缩放 ${Math.round(imageEditorState.zoom * 100)}% · ${canvas.width} × ${canvas.height}px`);
}

function imageEditorWheel(event) {
  if (!imageEditorState.hasImage || !event.ctrlKey) return;
  event.preventDefault();
  setImageEditorZoomAtPoint(
    imageEditorState.zoom * Math.exp(-event.deltaY * 0.006),
    event.clientX,
    event.clientY
  );
}

function imageEditorGestureStart(event) {
  if (!imageEditorState.hasImage) return;
  event.preventDefault();
  imageEditorState.gestureStartZoom = imageEditorState.zoom;
}

function imageEditorGestureChange(event) {
  if (!imageEditorState.hasImage) return;
  event.preventDefault();
  setImageEditorZoomAtPoint(
    imageEditorState.gestureStartZoom * event.scale,
    event.clientX,
    event.clientY
  );
}

function imageEditorKeyDown(event) {
  if (imageEditorState.mode === "screen") {
    if (event.key === "Enter") {
      const screen = imageEditorScreen();
      if (screen.image && screen.corners.length === 4 && !screen.interaction) {
        event.preventDefault();
        imageEditorScreenApply();
      }
      return;
    }
    if (event.key === "Escape") {
      event.preventDefault();
      const screen = imageEditorScreen();
      screen.activeCorner = -1;
      imageEditorScreenHideMagnifier();
      imageEditorScreenSyncOverlay();
      return;
    }
    if (event.key.startsWith("Arrow")) {
      imageEditorScreenHandleKey(event);
      return;
    }
  }
  if (event.key.toLowerCase() === "v" && !event.metaKey && !event.ctrlKey && !event.altKey) {
    event.preventDefault();
    setImageEditorMode("view");
  } else if (event.key.toLowerCase() === "c" && !event.metaKey && !event.ctrlKey && !event.altKey) {
    event.preventDefault();
    setImageEditorMode(imageEditorState.mode === "crop" ? "view" : "crop");
  } else if (event.key === "Enter" && imageEditorState.selection && !imageEditorState.interaction) {
    event.preventDefault();
    applyImageEditorSelection();
  } else if (event.key === "Enter" && imageEditorState.gradient && !imageEditorState.interaction) {
    event.preventDefault();
    applyImageEditorGradient();
  } else if (event.key === "Escape" && imageEditorState.selection && !imageEditorState.interaction) {
    event.preventDefault();
    cancelImageEditorSelection();
  } else if (event.key === "Escape" && imageEditorState.gradient && !imageEditorState.interaction) {
    event.preventDefault();
    cancelImageEditorGradient();
  }
}

function annotationCanvas() {
  return annotationState.host === "bg" ? $("#bgAnnotationCanvas") : $("#annotationCanvas");
}

function annotationContext() {
  return annotationCanvas().getContext("2d");
}

function annotationStage() {
  return annotationState.host === "bg" ? $("#blueBgStage") : $("#annotationStage");
}

function annotationSelectionOverlay() {
  return annotationState.host === "bg"
    ? $("#bgAnnotationSelectionOverlay")
    : $("#annotationSelectionOverlay");
}

function annotationControl(name) {
  if (annotationState.host !== "bg") return $(`#annotation${name}`);
  return $(`#bgAnnotation${name}`);
}

function setAnnotationCursor(cursor) {
  annotationCanvas().style.cursor = cursor;
  annotationStage().style.cursor = cursor;
}

function pushAnnotationHistory() {
  if (annotationState.host === "bg") {
    pushBgHistory();
    updateBgAnnotationControls();
    return;
  }
  const snapshot = annotationState.items.map(item => ({ ...item }));
  const signature = JSON.stringify(snapshot);
  if (annotationState.history[annotationState.historyIndex]?.signature === signature) return;
  annotationState.history = annotationState.history.slice(0, annotationState.historyIndex + 1);
  annotationState.history.push({ snapshot, signature });
  if (annotationState.history.length > 60) annotationState.history.shift();
  annotationState.historyIndex = annotationState.history.length - 1;
  updateAnnotationControls();
}

function resetAnnotationHistory() {
  annotationState.history = [];
  annotationState.historyIndex = -1;
  pushAnnotationHistory();
}

function restoreAnnotationHistory(index) {
  const entry = annotationState.history[index];
  if (!entry) return;
  annotationState.historyIndex = index;
  annotationState.items = entry.snapshot.map(item => ({ ...item }));
  annotationState.selectedId = annotationState.items.at(-1)?.id ?? null;
  annotationState.selectedIds = [];
  annotationState.selectedPart = annotationState.items.at(-1)?.type === "magnifier" ? "lens" : null;
  annotationState.nextId = Math.max(0, ...annotationState.items.map(item => item.id)) + 1;
  annotationState.nextNumber = Math.max(0, ...annotationState.items.filter(item => item.type === "number").map(item => item.number)) + 1;
  annotationState.numberSize = annotationState.items.find(item => item.type === "number")?.size ?? ANNOTATION_NUMBER_SIZE;
  annotationState.editingNumberId = null;
  updateAnnotationControls();
  renderAnnotationCanvas();
  annotationStatusText(`已恢复历史步骤 ${index + 1} · 共 ${annotationState.items.length} 个标注`);
}

function updateAnnotationControls() {
  if (annotationState.host === "bg") {
    updateBgAnnotationControls();
    return;
  }
  const hasImage = Boolean(annotationState.image);
  const selectedItems = selectedAnnotationItems();
  const selected = selectedItems.length === 1 ? selectedItems[0] : null;
  const hasSelection = selectedItems.length > 0;
  $("#annotationViewMode").disabled = !hasImage;
  $("#addAnnotationNumber").disabled = !hasImage;
  $("#addAnnotationMask").disabled = !hasImage;
  $("#addAnnotationBlur").disabled = !hasImage;
  $("#addAnnotationMagnifier").disabled = !hasImage;
  $("#exportAnnotation").disabled = !hasImage;
  $("#deleteAnnotation").disabled = !hasSelection;
  $("#annotationUndo").disabled = annotationState.historyIndex <= 0;
  $("#annotationRedo").disabled = annotationState.historyIndex < 0 ||
    annotationState.historyIndex >= annotationState.history.length - 1;
  $("#annotationViewMode").classList.toggle("active", annotationState.mode === "view");
  $("#addAnnotationNumber").classList.toggle("active", annotationState.mode === "number");
  $("#addAnnotationMask").classList.toggle("active", annotationState.mode === "mask");
  $("#addAnnotationBlur").classList.toggle("active", annotationState.mode === "blur");
  $("#addAnnotationMagnifier").classList.toggle("active", annotationState.mode === "magnifier");
  $("#annotationStage").dataset.mode = annotationState.mode;
  const blurControls = $("#annotationBlurControls");
  const showBlurControls = selected?.type === "blur";
  blurControls.hidden = !showBlurControls;
  if (showBlurControls) {
    $("#annotationBlurStrength").value = String(selected.strength);
    $("#annotationBlurStrengthValue").textContent = `${selected.strength}px`;
  }
  const magnifierControls = $("#annotationMagnifierControls");
  const showMagnifierControls = selected?.type === "magnifier";
  magnifierControls.hidden = !showMagnifierControls;
  if (showMagnifierControls) {
    $("#annotationMagnifierColor").value = selected.color;
    $("#annotationMagnifierWidth").value = String(selected.lineWidth);
    $("#annotationMagnifierWidthValue").textContent = `${selected.lineWidth}px`;
  }
  const numberControls = $("#annotationNumberControls");
  const showNumberControls = selected?.type === "number" && annotationState.editingNumberId === null;
  numberControls.hidden = !showNumberControls;
  if (showNumberControls) {
    const size = annotationNumberSize(selected);
    $("#annotationNumberSize").value = String(size);
    $("#annotationNumberSizeValue").textContent = `${size}px`;
  }
  $("#annotationNumberEditor").hidden = true;
}

function updateBgAnnotationControls() {
  const hasImage = blueBgState.layers.length > 0;
  const selectedItems = selectedAnnotationItems();
  const selected = selectedItems.length === 1 ? selectedItems[0] : null;
  const annotationActive = blueBgState.toolMode === "annotation";
  const creationType = ["mask", "blur", "number", "magnifier", "pen"].includes(annotationState.mode)
    ? annotationState.mode
    : null;
  const displayType = selected?.type || (annotationActive ? creationType : null);
  [
    ["#bgAddAnnotationNumber", "number"],
    ["#bgAddAnnotationMask", "mask"],
    ["#bgAddAnnotationBlur", "blur"],
    ["#bgAddAnnotationMagnifier", "magnifier"],
    ["#bgAddAnnotationPen", "pen"],
  ].forEach(([selector, mode]) => {
    const button = $(selector);
    button.disabled = !hasImage;
    button.classList.toggle("active", annotationActive && annotationState.mode === mode);
  });
  if (blueBgState.inspectorMode === "annotation" && !displayType) {
    const hasSelectedLayer = selectedBlueBgLayers().length > 0;
    blueBgState.toolMode = hasSelectedLayer ? "move" : "background";
    setBgInspectorMode(hasSelectedLayer ? "effects" : "background");
    return;
  }
  const inspector = $("#bgAnnotationInspector");
  const showInspector = blueBgState.inspectorMode === "annotation";
  inspector.hidden = !showInspector;
  const maskControls = $("#bgAnnotationMaskControls");
  const blurControls = $("#bgAnnotationBlurControls");
  const numberControls = $("#bgAnnotationNumberControls");
  const magnifierControls = $("#bgAnnotationMagnifierControls");
  const penControls = $("#bgAnnotationPenControls");
  maskControls.hidden = displayType !== "mask";
  blurControls.hidden = displayType !== "blur";
  numberControls.hidden = displayType !== "number";
  magnifierControls.hidden = displayType !== "magnifier";
  penControls.hidden = displayType !== "pen";
  const maskColor = selected?.type === "mask"
    ? selected.color || "#98b2c0"
    : annotationState.maskColor || "#98b2c0";
  syncBgAnnotationColorTiles("mask", maskColor);
  const maskShadow = selected?.type === "mask" ? Boolean(selected.shadow) : Boolean(annotationState.shadows.mask);
  const maskRound = selected?.type === "mask" ? Boolean(selected.round) : Boolean(annotationState.maskRound);
  const maskRadius = selected?.type === "mask"
    ? Number(selected.cornerRadius) || 16
    : annotationState.maskRoundRadius || 16;
  $("#bgAnnotationMaskShadow").checked = maskShadow;
  $("#bgAnnotationMaskRound").checked = maskRound;
  $("#bgAnnotationMaskRoundRadius").disabled = !maskRound;
  $("#bgAnnotationMaskRoundRadius").value = String(maskRadius);
  $("#bgAnnotationMaskRoundRadiusValue").textContent = `${maskRadius} px`;
  if (displayType === "blur") {
    const strength = selected?.type === "blur" ? selected.strength : annotationState.blurStrength;
    $("#bgAnnotationBlurStrength").value = String(strength);
    $("#bgAnnotationBlurStrengthValue").textContent = `${strength}px`;
    $("#bgAnnotationBlurShadow").checked = selected?.type === "blur"
      ? Boolean(selected.shadow)
      : Boolean(annotationState.shadows.blur);
  }
  if (displayType === "number") {
    const size = selected?.type === "number" ? annotationNumberSize(selected) : annotationState.numberSize;
    const color = selected?.type === "number" ? selected.color || "#ff5a52" : annotationState.numberColor;
    if (document.activeElement !== $("#bgAnnotationNumberInput")) {
      $("#bgAnnotationNumberInput").value = String(
        selected?.type === "number" ? selected.number : annotationState.nextNumber
      );
    }
    $("#bgAnnotationNumberSize").value = String(size);
    $("#bgAnnotationNumberSizeValue").textContent = `${size}px`;
    $("#bgAnnotationNumberShadow").checked = selected?.type === "number"
      ? Boolean(selected.shadow)
      : Boolean(annotationState.shadows.number);
    syncBgAnnotationColorTiles("number", color);
  }
  if (displayType === "magnifier") {
    const color = selected?.type === "magnifier" ? selected.color : annotationState.magnifierColor;
    const width = selected?.type === "magnifier" ? selected.lineWidth : annotationState.magnifierWidth;
    $("#bgAnnotationMagnifierWidth").value = String(width);
    $("#bgAnnotationMagnifierWidthValue").textContent = `${width}px`;
    $("#bgAnnotationMagnifierShadow").checked = selected?.type === "magnifier"
      ? Boolean(selected.shadow)
      : Boolean(annotationState.shadows.magnifier);
    syncBgAnnotationColorTiles("magnifier", color);
  }
  if (displayType === "pen") {
    const color = selected?.type === "pen" ? selected.color : annotationState.penColor;
    const width = selected?.type === "pen" ? Number(selected.lineWidth) || 6 : annotationState.penWidth || 6;
    $("#bgAnnotationPenWidth").value = String(width);
    $("#bgAnnotationPenWidthValue").textContent = `${width} px`;
    $("#bgAnnotationPenShadow").checked = selected?.type === "pen"
      ? Boolean(selected.shadow)
      : Boolean(annotationState.shadows.pen);
    syncBgAnnotationColorTiles("pen", color);
  }
  $("#bgDeleteSelected").disabled = !selectedItems.length && !selectedBlueBgLayers().length;
}

function syncBgAnnotationColorTiles(kind, color) {
  const normalized = String(color || "").toLowerCase();
  const buttons = $$(`[data-annotation-color-kind="${kind}"]`, $("#bgAnnotationInspector"));
  const matchingPreset = buttons.find(button => button.dataset.annotationColor.toLowerCase() === normalized);
  buttons.forEach(button => {
    button.classList.toggle("active", button === matchingPreset);
  });
  const inputId = {
    mask: "#bgAnnotationMaskColor",
    number: "#bgAnnotationNumberColor",
    magnifier: "#bgAnnotationMagnifierColor",
    pen: "#bgAnnotationPenColor",
  }[kind];
  const custom = $(inputId)?.closest(".bg-annotation-custom-color");
  if (custom) {
    custom.classList.toggle("active", !matchingPreset && storedBgAnnotationCustomColor(kind) === normalized);
  }
}

function storedBgAnnotationCustomColor(kind) {
  const config = BG_ANNOTATION_CUSTOM_COLORS[kind];
  if (!config) return "";
  return String(localStorage.getItem(config.key) || config.fallback).toLowerCase();
}

function syncBgAnnotationCustomColorTile(kind) {
  const config = BG_ANNOTATION_CUSTOM_COLORS[kind];
  if (!config) return;
  const input = $(config.input);
  const custom = input?.closest(".bg-annotation-custom-color");
  const preview = custom?.querySelector(".bg-annotation-color-preview");
  const color = storedBgAnnotationCustomColor(kind);
  if (input) input.value = color;
  if (preview) preview.style.setProperty("--swatch", color);
}

function initializeBgAnnotationCustomColors() {
  Object.keys(BG_ANNOTATION_CUSTOM_COLORS).forEach(syncBgAnnotationCustomColorTile);
  $$(".bg-annotation-color-grid > button, .bg-annotation-custom-select").forEach(button => {
    const label = button.querySelector("strong")?.textContent?.trim();
    if (!label) return;
    if (!button.title) button.title = label;
    if (!button.getAttribute("aria-label")) button.setAttribute("aria-label", label);
  });
}

function saveBgAnnotationCustomColor(kind, color) {
  const config = BG_ANNOTATION_CUSTOM_COLORS[kind];
  if (!config) return;
  const normalized = String(color || config.fallback).toLowerCase();
  localStorage.setItem(config.key, normalized);
  syncBgAnnotationCustomColorTile(kind);
  updateBgAnnotationColor(kind, normalized);
}

function annotationStatusText(message) {
  if (annotationState.host === "bg") blueBgStatus(message);
  else $("#annotationStatus").textContent = message;
}

function penStrokeBounds(item) {
  const points = item.points || [];
  if (!points.length) return { x: 0, y: 0, width: 0, height: 0 };
  let left = Infinity, top = Infinity, right = -Infinity, bottom = -Infinity;
  points.forEach(point => {
    left = Math.min(left, point.x);
    top = Math.min(top, point.y);
    right = Math.max(right, point.x);
    bottom = Math.max(bottom, point.y);
  });
  const halfWidth = (Number(item.lineWidth) || 6) / 2;
  return {
    x: left - halfWidth,
    y: top - halfWidth,
    width: right - left + halfWidth * 2,
    height: bottom - top + halfWidth * 2,
  };
}

function annotationItemBounds(item) {
  if (item.type === "number") {
    const size = annotationNumberSize(item);
    return expandAnnotationBoundsForShadow(item, {
      x: item.x - size / 2,
      y: item.y - size / 2,
      width: size,
      height: size,
    });
  }
  if (item.type === "magnifier") {
    const left = Math.min(
      magnifierVisualBounds(item, "source").x,
      magnifierVisualBounds(item, "lens").x
    );
    const top = Math.min(
      magnifierVisualBounds(item, "source").y,
      magnifierVisualBounds(item, "lens").y
    );
    const right = Math.max(
      magnifierVisualBounds(item, "source").x + magnifierVisualBounds(item, "source").width,
      magnifierVisualBounds(item, "lens").x + magnifierVisualBounds(item, "lens").width
    );
    const bottom = Math.max(
      magnifierVisualBounds(item, "source").y + magnifierVisualBounds(item, "source").height,
      magnifierVisualBounds(item, "lens").y + magnifierVisualBounds(item, "lens").height
    );
    return expandAnnotationBoundsForShadow(item, { x: left, y: top, width: right - left, height: bottom - top });
  }
  if (item.type === "pen") {
    return expandAnnotationBoundsForShadow(item, penStrokeBounds(item));
  }
  return expandAnnotationBoundsForShadow(item, { x: item.x, y: item.y, width: item.width, height: item.height });
}

function annotationShadowOutset(item) {
  return item?.shadow ? 30 : 0;
}

function expandAnnotationBoundsForShadow(item, bounds) {
  const outset = annotationShadowOutset(item);
  return {
    x: bounds.x - outset,
    y: bounds.y - outset,
    width: bounds.width + outset * 2,
    height: bounds.height + outset * 2,
  };
}

function selectedAnnotationItems() {
  const ids = annotationState.selectedIds.length
    ? new Set(annotationState.selectedIds)
    : new Set(annotationState.selectedId === null ? [] : [annotationState.selectedId]);
  return annotationState.items.filter(item => ids.has(item.id));
}

function annotationSelectionBounds() {
  return unionBounds(selectedAnnotationItems().map(annotationItemBounds));
}

function annotationSelectionEntries() {
  return selectedAnnotationItems()
    .flatMap(item => {
      if (item.type !== "magnifier") return [{ id: item.id, bounds: annotationItemBounds(item) }];
      return selectedMagnifierParts(item).map(part => ({
        id: `${item.id}-${part}`,
        bounds: magnifierPartBounds(item, part),
      }));
    })
    .sort((a, b) => Number(b.id === annotationState.selectedId) - Number(a.id === annotationState.selectedId));
}

function annotationNumberSize(item) {
  return Number(item?.size) || annotationState.numberSize || ANNOTATION_NUMBER_SIZE;
}

function magnifierPartBounds(item, part) {
  const prefix = part === "source" ? "source" : "lens";
  const radius = item[`${prefix}Radius`];
  const margin = magnifierStrokeMargin(item) + annotationShadowOutset(item);
  return {
    x: item[`${prefix}X`] - radius - margin,
    y: item[`${prefix}Y`] - radius - margin,
    width: (radius + margin) * 2,
    height: (radius + margin) * 2,
  };
}

function magnifierVisualBounds(item, part) {
  const prefix = part === "source" ? "source" : "lens";
  const radius = item[`${prefix}Radius`];
  const margin = magnifierStrokeMargin(item);
  return {
    x: item[`${prefix}X`] - radius - margin,
    y: item[`${prefix}Y`] - radius - margin,
    width: (radius + margin) * 2,
    height: (radius + margin) * 2,
  };
}

function magnifierStrokeMargin(item) {
  return (Number(item?.lineWidth) || ANNOTATION_MAGNIFIER_LINE_WIDTH) / 2 + 1;
}

function magnifierSelectionMargin(item) {
  return magnifierStrokeMargin(item) + annotationShadowOutset(item) + canvasDisplayUnit(annotationCanvas());
}

function selectedMagnifierParts(item) {
  if (!selectedAnnotationItems().some(candidate => candidate.id === item.id)) return [];
  const sourceCovered = Math.hypot(item.lensX - item.sourceX, item.lensY - item.sourceY) + item.sourceRadius <= item.lensRadius;
  if (item.id === annotationState.selectedId && annotationState.selectedPart) {
    return annotationState.selectedPart === "source" && sourceCovered ? [] : [annotationState.selectedPart];
  }
  return sourceCovered ? ["lens"] : ["source", "lens"];
}

function drawAnnotationItem(ctx, item, includeSelection = false) {
  if (!item.shadow) {
    drawAnnotationItemContent(ctx, item, includeSelection);
    return;
  }
  const surface = document.createElement("canvas");
  surface.width = ctx.canvas.width;
  surface.height = ctx.canvas.height;
  drawAnnotationItemContent(surface.getContext("2d"), item, false);
  ctx.save();
  ctx.shadowColor = "rgba(0, 0, 0, .28)";
  ctx.shadowBlur = 18;
  ctx.shadowOffsetX = 0;
  ctx.shadowOffsetY = 6;
  ctx.drawImage(surface, 0, 0);
  ctx.restore();
}

function drawAnnotationItemContent(ctx, item, includeSelection = false) {
  if (item.type === "number") {
    const size = annotationNumberSize(item);
    const radius = size / 2;
    ctx.save();
    ctx.fillStyle = item.color || "#ff5a52";
    ctx.beginPath();
    ctx.arc(item.x, item.y, radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#ffffff";
    const fontSize = size * (String(item.number).length >= 3 ? 50 / 110 : 70 / 110);
    ctx.font = `450 ${fontSize}px -apple-system, BlinkMacSystemFont, "SF Pro Text", "Segoe UI", MiSans, sans-serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(String(item.number), item.x, item.y + size * 2 / 110);
    ctx.restore();
    return;
  }
  if (item.type === "magnifier") {
    if (item.sourceRadius < 1) return;
    const hasLens = item.lensRadius >= 1;
    const dx = item.lensX - item.sourceX;
    const dy = item.lensY - item.sourceY;
    const distance = Math.max(1, Math.hypot(dx, dy));
    const unitX = dx / distance;
    const unitY = dy / distance;
    ctx.save();
    ctx.strokeStyle = item.color;
    ctx.lineWidth = item.lineWidth;
    ctx.lineCap = "round";
    if (hasLens) {
      ctx.beginPath();
      ctx.moveTo(
        item.sourceX + unitX * item.sourceRadius,
        item.sourceY + unitY * item.sourceRadius
      );
      ctx.lineTo(
        item.lensX - unitX * item.lensRadius,
        item.lensY - unitY * item.lensRadius
      );
      ctx.stroke();
    }

    ctx.beginPath();
    ctx.arc(item.sourceX, item.sourceY, item.sourceRadius, 0, Math.PI * 2);
    ctx.stroke();
    if (!hasLens) {
      ctx.restore();
      return;
    }

    ctx.save();
    ctx.beginPath();
    ctx.arc(item.lensX, item.lensY, item.lensRadius, 0, Math.PI * 2);
    ctx.clip();
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(
      item.lensX - item.lensRadius,
      item.lensY - item.lensRadius,
      item.lensRadius * 2,
      item.lensRadius * 2
    );
    ctx.drawImage(
      annotationState.image,
      item.sourceX - item.sourceRadius,
      item.sourceY - item.sourceRadius,
      item.sourceRadius * 2,
      item.sourceRadius * 2,
      item.lensX - item.lensRadius,
      item.lensY - item.lensRadius,
      item.lensRadius * 2,
      item.lensRadius * 2
    );
    ctx.restore();
    ctx.beginPath();
    ctx.arc(item.lensX, item.lensY, item.lensRadius, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
    return;
  }
  if (item.type === "pen") {
    const points = item.points || [];
    if (points.length < 2) {
      const only = points[0];
      if (!only) return;
      ctx.save();
      ctx.fillStyle = item.color || "#ff5a52";
      ctx.beginPath();
      ctx.arc(only.x, only.y, Math.max(1, item.lineWidth / 2), 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
      return;
    }
    ctx.save();
    ctx.strokeStyle = item.color || "#ff5a52";
    ctx.lineWidth = item.lineWidth;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);
    for (let index = 1; index < points.length; index++) {
      ctx.lineTo(points[index].x, points[index].y);
    }
    if (points.length === 2) {
      // 两点时补一段极短的重合路径，保证单击拖出的短线也有圆头。
      ctx.lineTo(points[1].x + 0.01, points[1].y + 0.01);
    }
    ctx.stroke();
    ctx.restore();
    return;
  }
  if (item.type === "blur") {
    ctx.save();
    ctx.beginPath();
    ctx.rect(item.x, item.y, item.width, item.height);
    ctx.clip();
    ctx.filter = `blur(${item.strength}px)`;
    ctx.drawImage(annotationState.image, 0, 0);
    ctx.restore();
  } else {
    ctx.save();
    ctx.fillStyle = item.color || "#98b2c0";
    if (item.round) {
      continuousRoundedRect(
        ctx,
        item.x,
        item.y,
        item.width,
        item.height,
        Math.min(Number(item.cornerRadius) || 0, item.width / 2, item.height / 2)
      );
      ctx.fill();
    } else {
      ctx.fillRect(item.x, item.y, item.width, item.height);
    }
    ctx.restore();
  }
}

function drawAnnotationSelection(ctx, item) {
  const canvas = annotationCanvas();
  const bounds = selectionFrameBounds(canvas, annotationItemBounds(item));
  drawMarchingAntsSelection(ctx, canvas, bounds);
}

function renderAnnotationCanvas(includeSelection = true) {
  if (!annotationState.image) {
    syncCanvasSelectionOverlays(
      annotationStage(), annotationCanvas(), annotationSelectionOverlay(), []
    );
    return;
  }
  const canvas = annotationCanvas();
  const ctx = annotationContext();
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  if (annotationState.host !== "bg") ctx.drawImage(annotationState.image, 0, 0);
  annotationState.items.forEach(item => drawAnnotationItem(ctx, item, includeSelection));
  drawCanvasSnapGuides(ctx, canvas, annotationState.snapGuides);
  if (includeSelection) {
    syncCanvasSelectionOverlays(
      annotationStage(),
      canvas,
      annotationSelectionOverlay(),
      annotationSelectionEntries()
    );
  } else {
    syncCanvasSelectionOverlays(
      annotationStage(),
      canvas,
      annotationSelectionOverlay(),
      []
    );
  }
  syncAnnotationNumberInlineEditor();
}

function applyAnnotationZoom(zoom) {
  if (!annotationState.image || !annotationState.baseDisplayWidth) return;
  annotationState.zoom = Math.max(0.5, Math.min(20, zoom));
  const canvas = annotationCanvas();
  canvas.style.width = `${annotationState.baseDisplayWidth * annotationState.zoom}px`;
  canvas.style.height = `${annotationState.baseDisplayHeight * annotationState.zoom}px`;
  canvas.style.imageRendering = annotationState.zoom >= 4 ? "pixelated" : "auto";
  annotationStage().classList.toggle("at-base-zoom", annotationState.zoom <= 1.001);
  if (annotationState.mode === "view") {
    setAnnotationCursor(annotationState.zoom > 1.001 ? "grab" : "default");
  }
  requestAnimationFrame(() => {
    renderAnnotationCanvas();
  });
}

function resetAnnotationZoom() {
  const canvas = annotationCanvas();
  canvas.style.width = "";
  canvas.style.height = "";
  canvas.style.maxWidth = "";
  canvas.style.maxHeight = "";
  annotationState.zoom = 1;
  annotationState.baseDisplayWidth = 0;
  annotationState.baseDisplayHeight = 0;
  requestAnimationFrame(() => {
    if (!annotationState.image) return;
    const rect = canvas.getBoundingClientRect();
    annotationState.baseDisplayWidth = rect.width;
    annotationState.baseDisplayHeight = rect.height;
    canvas.style.maxWidth = "none";
    canvas.style.maxHeight = "none";
    applyAnnotationZoom(1);
  });
}

function loadAnnotationImage(file) {
  if (!file) return;
  const url = URL.createObjectURL(file);
  const image = new Image();
  image.onload = () => {
    URL.revokeObjectURL(url);
    const canvas = annotationCanvas();
    canvas.width = image.naturalWidth;
    canvas.height = image.naturalHeight;
    annotationState.image = image;
    annotationState.sourceName = file.name;
    annotationState.mode = "view";
    annotationState.items = [];
    annotationState.selectedId = null;
    annotationState.selectedIds = [];
    annotationState.selectedPart = null;
    annotationState.numberSize = ANNOTATION_NUMBER_SIZE;
    annotationState.nextNumber = 1;
    annotationState.nextId = 1;
    annotationState.interaction = null;
    annotationState.snapGuides = emptySnapGuides();
    annotationState.editingNumberId = null;
    resetAnnotationHistory();
    $("#annotationStage").classList.add("has-image");
    renderAnnotationCanvas();
    resetAnnotationZoom();
    updateAnnotationControls();
    annotationStatusText(`${image.naturalWidth} × ${image.naturalHeight}px · 0 个标注`);
  };
  image.onerror = () => {
    URL.revokeObjectURL(url);
    annotationStatusText("无法读取这张图片，请换一张重试。");
  };
  image.src = url;
}

function setAnnotationMode(mode) {
  if (!annotationState.image) return;
  if (annotationState.editingNumberId !== null) closeAnnotationNumberInlineEditor(true);
  const previousMode = annotationState.mode;
  if (annotationState.host === "bg" && mode !== "pen") hideBgAnnotationPenCursor();
  if (["number", "mask", "blur", "magnifier", "pen"].includes(mode)) {
    annotationState.selectedId = null;
    annotationState.selectedIds = [];
    annotationState.selectedPart = null;
    annotationState.editingNumberId = null;
  }
  if (mode === "number" && previousMode !== "number") annotationState.nextNumber = 1;
  annotationState.mode = mode;
  annotationState.interaction = null;
  annotationState.snapGuides = emptySnapGuides();
  setAnnotationCursor(
    ["number", "mask", "blur", "magnifier", "pen"].includes(mode)
      ? mode === "pen" && annotationState.host === "bg" ? "none" : "crosshair"
      : annotationState.zoom > 1.001 ? "grab" : "default"
  );
  updateAnnotationControls();
  renderAnnotationCanvas();
  const messages = {
    view: "查看模式：可选择、移动和调整现有标注。",
    number: "序号模式：在图像中点击即可放置序号。",
    mask: "遮挡模式：在图像中拖动框选遮挡区域。",
    blur: "模糊模式：在图像中拖动框选高斯模糊区域。",
    magnifier: "放大镜模式：拖动划定小圆范围，松开后会在右下角创建实时放大圆。",
    pen: "画笔模式：按住拖动即可绘制线条，粗细与颜色可在右侧调节。",
  };
  annotationStatusText(messages[mode]);
  annotationStage().focus();
}

function clampAnnotationItem(item) {
  const canvas = annotationCanvas();
  if (item.type === "number") {
    const radius = annotationNumberSize(item) / 2;
    item.x = Math.max(radius, Math.min(canvas.width - radius, item.x));
    item.y = Math.max(radius, Math.min(canvas.height - radius, item.y));
    return;
  }
  if (item.type === "pen") {
    // 笔迹整体不缩放，越界时平移回画布内。
    const bounds = penStrokeBounds(item);
    let dx = 0;
    let dy = 0;
    if (bounds.width <= canvas.width) {
      dx = bounds.x < 0 ? -bounds.x : (bounds.x + bounds.width > canvas.width ? canvas.width - bounds.x - bounds.width : 0);
    }
    if (bounds.height <= canvas.height) {
      dy = bounds.y < 0 ? -bounds.y : (bounds.y + bounds.height > canvas.height ? canvas.height - bounds.y - bounds.height : 0);
    }
    if (dx || dy) {
      item.points = (item.points || []).map(point => ({ x: point.x + dx, y: point.y + dy }));
    }
    return;
  }
  if (item.type === "magnifier") {
    const minimumRadius = Math.min(20, canvas.width / 4, canvas.height / 4);
    const clampCircle = (xKey, yKey, radiusKey) => {
      const edgeMargin = magnifierStrokeMargin(item);
      const maximumRadius = Math.max(
        minimumRadius,
        Math.min(canvas.width / 2 - edgeMargin, canvas.height / 2 - edgeMargin)
      );
      item[radiusKey] = Math.max(minimumRadius, Math.min(maximumRadius, item[radiusKey]));
      const inset = item[radiusKey] + edgeMargin;
      item[xKey] = Math.max(inset, Math.min(canvas.width - inset, item[xKey]));
      item[yKey] = Math.max(inset, Math.min(canvas.height - inset, item[yKey]));
    };
    clampCircle("sourceX", "sourceY", "sourceRadius");
    clampCircle("lensX", "lensY", "lensRadius");
    return;
  }
  // 新建和调整遮挡时保留用户实际画出的尺寸；过小的框会在松手阶段直接丢弃。
  item.width = Math.max(2, Math.min(canvas.width, item.width));
  item.height = Math.max(2, Math.min(canvas.height, item.height));
  item.x = Math.max(0, Math.min(canvas.width - item.width, item.x));
  item.y = Math.max(0, Math.min(canvas.height - item.height, item.y));
}

function addAnnotationNumber() {
  if (!annotationState.image) return;
  const canvas = annotationCanvas();
  const column = (annotationState.nextNumber - 1) % 8;
  const row = Math.floor((annotationState.nextNumber - 1) / 8) % 3;
  const gap = 20;
  const size = annotationState.numberSize;
  const item = {
    id: annotationState.nextId++,
    type: "number",
    number: annotationState.nextNumber++,
    size,
    color: annotationState.numberColor || "#ff5a52",
    shadow: Boolean(annotationState.shadows.number),
    x: canvas.width - size / 2 - 28 - column * (size + gap),
    y: canvas.height - size / 2 - 28 - row * (size + gap),
  };
  clampAnnotationItem(item);
  annotationState.items.push(item);
  annotationState.selectedId = item.id;
  annotationState.selectedIds = [];
  annotationState.selectedPart = null;
  finishAnnotationChange(`已添加序号 ${item.number}`);
}

function addAnnotationNumberAt(point) {
  const item = {
    id: annotationState.nextId++,
    type: "number",
    number: annotationState.nextNumber++,
    size: annotationState.numberSize,
    color: annotationState.numberColor || "#ff5a52",
    shadow: Boolean(annotationState.shadows.number),
    x: point.x,
    y: point.y,
  };
  clampAnnotationItem(item);
  annotationState.items.push(item);
  annotationState.selectedId = item.id;
  annotationState.selectedIds = [];
  annotationState.selectedPart = null;
  finishAnnotationChange(`已在点击位置添加序号 ${item.number}`);
}

function addAnnotationMask() {
  if (!annotationState.image) return;
  const canvas = annotationCanvas();
  const width = Math.max(40, Math.min(280, canvas.width * 0.3));
  const height = Math.max(30, Math.min(80, canvas.height * 0.12));
  const item = {
    id: annotationState.nextId++,
    type: "mask",
    x: (canvas.width - width) / 2,
    y: (canvas.height - height) / 2,
    width,
    height,
    color: annotationState.maskColor || "#98b2c0",
    shadow: Boolean(annotationState.shadows.mask),
    round: Boolean(annotationState.maskRound),
    cornerRadius: annotationState.maskRoundRadius || 16,
  };
  clampAnnotationItem(item);
  annotationState.items.push(item);
  annotationState.selectedId = item.id;
  annotationState.selectedIds = [];
  annotationState.selectedPart = null;
  finishAnnotationChange("已添加遮挡块");
}

function addAnnotationBlur() {
  if (!annotationState.image) return;
  const canvas = annotationCanvas();
  const width = Math.max(40, Math.min(360, canvas.width * 0.34));
  const height = Math.max(30, Math.min(120, canvas.height * 0.16));
  const item = {
    id: annotationState.nextId++,
    type: "blur",
    x: (canvas.width - width) / 2,
    y: (canvas.height - height) / 2,
    width,
    height,
    strength: annotationState.blurStrength || 6,
    shadow: Boolean(annotationState.shadows.blur),
  };
  clampAnnotationItem(item);
  annotationState.items.push(item);
  annotationState.selectedId = item.id;
  annotationState.selectedIds = [];
  annotationState.selectedPart = null;
  finishAnnotationChange("已添加高斯模糊");
}

function updateAnnotationMagnifierStyle() {
  const selected = annotationState.items.find(item => item.id === annotationState.selectedId);
  const color = annotationControl("MagnifierColor").value;
  const width = Number(annotationControl("MagnifierWidth").value);
  annotationState.magnifierColor = color;
  annotationState.magnifierWidth = width;
  if (selected?.type === "magnifier") {
    selected.color = color;
    selected.lineWidth = width;
  }
  annotationControl("MagnifierWidthValue").textContent = `${width}px`;
  renderAnnotationCanvas();
  annotationStatusText(`放大镜线条 ${width}px · 共 ${annotationState.items.length} 个标注`);
}

function updateAnnotationNumberSize() {
  const selected = annotationState.items.find(item => item.id === annotationState.selectedId);
  const size = Number(annotationControl("NumberSize").value);
  annotationState.numberSize = size;
  annotationState.items
    .filter(item => item.type === "number")
    .forEach(item => {
      item.size = size;
      clampAnnotationItem(item);
    });
  annotationControl("NumberSizeValue").textContent = `${size}px`;
  renderAnnotationCanvas();
  annotationStatusText(`全部序号大小 ${size}px · 共 ${annotationState.items.length} 个标注`);
}

function updateBgAnnotationNumberValue() {
  const input = $("#bgAnnotationNumberInput");
  const normalized = input.value.trim();
  if (!/^\d+$/.test(normalized) || Number(normalized) < 1) return;
  const number = Number(normalized);
  const selectedItems = selectedAnnotationItems();
  const selected = selectedItems.length === 1 && selectedItems[0].type === "number"
    ? selectedItems[0]
    : null;
  if (selected) {
    selected.number = number;
    annotationState.nextNumber = Math.max(annotationState.nextNumber, number + 1);
    renderAnnotationCanvas();
    annotationStatusText(`序号已修改为 ${number}`);
    return;
  }
  annotationState.nextNumber = number;
  annotationStatusText(`下一个序号将从 ${number} 开始`);
}

function updateAnnotationBlurStrength() {
  const selected = annotationState.items.find(item => item.id === annotationState.selectedId);
  const strength = Number(annotationControl("BlurStrength").value);
  annotationState.blurStrength = strength;
  if (selected?.type === "blur") selected.strength = strength;
  annotationControl("BlurStrengthValue").textContent = `${strength}px`;
  renderAnnotationCanvas();
  annotationStatusText(`模糊强度 ${strength}px · 共 ${annotationState.items.length} 个标注`);
}

function updateBgAnnotationColor(kind, color) {
  annotationState = bgAnnotationState;
  const normalized = String(color || "#98b2c0").toLowerCase();
  const stateKey = {
    mask: "maskColor",
    number: "numberColor",
    magnifier: "magnifierColor",
    pen: "penColor",
  }[kind];
  if (!stateKey) return;
  annotationState[stateKey] = normalized;
  selectedAnnotationItems()
    .filter(item => item.type === kind)
    .forEach(item => { item.color = normalized; });
  updateBgAnnotationControls();
  renderAnnotationCanvas(true);
  const label = { mask: "遮挡颜色", number: "序号颜色", magnifier: "线条颜色", pen: "画笔颜色" }[kind];
  annotationStatusText(`${label} ${normalized.toUpperCase()} · 共 ${annotationState.items.length} 个标注`);
}

function updateBgAnnotationShadow(kind, enabled) {
  annotationState = bgAnnotationState;
  annotationState.shadows[kind] = Boolean(enabled);
  selectedAnnotationItems()
    .filter(item => item.type === kind)
    .forEach(item => { item.shadow = Boolean(enabled); });
  updateBgAnnotationControls();
  renderAnnotationCanvas(true);
  annotationStatusText(`${enabled ? "已开启" : "已关闭"}阴影效果 · 共 ${annotationState.items.length} 个标注`);
}

function updateBgAnnotationMaskRound() {
  annotationState = bgAnnotationState;
  const enabled = $("#bgAnnotationMaskRound").checked;
  annotationState.maskRound = enabled;
  selectedAnnotationItems()
    .filter(item => item.type === "mask")
    .forEach(item => { item.round = enabled; });
  updateBgAnnotationControls();
  renderAnnotationCanvas(true);
  annotationStatusText(`${enabled ? "已开启" : "已关闭"}圆角效果 · 共 ${annotationState.items.length} 个标注`);
}

function updateBgAnnotationMaskRadius() {
  annotationState = bgAnnotationState;
  const radius = Number($("#bgAnnotationMaskRoundRadius").value);
  annotationState.maskRoundRadius = radius;
  selectedAnnotationItems()
    .filter(item => item.type === "mask")
    .forEach(item => { item.cornerRadius = radius; });
  $("#bgAnnotationMaskRoundRadiusValue").textContent = `${radius} px`;
  renderAnnotationCanvas(true);
  annotationStatusText(`遮挡圆角 ${radius}px · 共 ${annotationState.items.length} 个标注`);
}

function updateAnnotationPenWidth() {
  const width = Math.max(1, Math.round(Number($("#bgAnnotationPenWidth").value) || 6));
  annotationState.penWidth = width;
  selectedAnnotationItems()
    .filter(item => item.type === "pen")
    .forEach(item => { item.lineWidth = width; });
  $("#bgAnnotationPenWidthValue").textContent = `${width} px`;
  renderAnnotationCanvas(true);
  annotationStatusText(`画笔粗细 ${width}px · 共 ${annotationState.items.length} 个标注`);
}

function finishAnnotationChange(message) {
  annotationState.editingNumberId = null;
  pushAnnotationHistory();
  renderAnnotationCanvas();
  updateAnnotationControls();
  annotationStatusText(`${message} · 共 ${annotationState.items.length} 个标注`);
}

function deleteSelectedAnnotation() {
  const selected = selectedAnnotationItems();
  const ids = new Set(selected.map(item => item.id));
  if (!ids.size) return;
  annotationState.items = annotationState.items.filter(item => !ids.has(item.id));
  annotationState.selectedId = null;
  annotationState.selectedIds = [];
  annotationState.selectedPart = null;
  finishAnnotationChange(`已删除 ${ids.size} 个标注`);
}

function annotationPointerPosition(event) {
  const canvas = annotationCanvas();
  const rect = canvas.getBoundingClientRect();
  return {
    x: (event.clientX - rect.left) * canvas.width / rect.width,
    y: (event.clientY - rect.top) * canvas.height / rect.height,
  };
}

function pointInsideCanvasClientRect(event, canvas = annotationCanvas()) {
  const rect = canvas.getBoundingClientRect();
  return event.clientX >= rect.left && event.clientX <= rect.right &&
    event.clientY >= rect.top && event.clientY <= rect.bottom;
}

function nativeAnnotationStagePointerDown(event) {
  annotationState = nativeAnnotationState;
  const hit = (() => {
    if (!annotationState.items.length) return false;
    const point = annotationPointerPosition(event);
    return selectedAnnotationItems().some(item => hitAnnotationHandle(item, point)) ||
      annotationState.items.some(item => pointInAnnotationItem(item, point));
  })();
  if (!pointInsideCanvasClientRect(event) && !hit) return;
  annotationPointerDown(event);
}

function annotationResizeHandles(item) {
  return [
    { key: "nw", x: item.x, y: item.y },
    { key: "n", x: item.x + item.width / 2, y: item.y },
    { key: "ne", x: item.x + item.width, y: item.y },
    { key: "e", x: item.x + item.width, y: item.y + item.height / 2 },
    { key: "se", x: item.x + item.width, y: item.y + item.height },
    { key: "s", x: item.x + item.width / 2, y: item.y + item.height },
    { key: "sw", x: item.x, y: item.y + item.height },
    { key: "w", x: item.x, y: item.y + item.height / 2 },
  ];
}

function hitAnnotationHandle(item, point) {
  if (item?.type === "magnifier") {
    const part = [...selectedMagnifierParts(item)].reverse().find(candidate => {
      const handle = hitSelectionHandle(
        selectionFrameBounds(annotationCanvas(), magnifierPartBounds(item, candidate)),
        point,
        annotationCanvas(),
        12
      );
      return ["nw", "ne", "se", "sw"].includes(handle);
    });
    if (part) {
      const handle = hitSelectionHandle(
        selectionFrameBounds(annotationCanvas(), magnifierPartBounds(item, part)),
        point,
        annotationCanvas(),
        12
      );
      return `magnifier-${part}-${handle}`;
    }
    return null;
  }
  if (item?.type === "number") {
    return hitSelectionHandle(
      selectionFrameBounds(annotationCanvas(), annotationItemBounds(item)),
      point,
      annotationCanvas(),
      12
    );
  }
  if (item?.type !== "mask" && item?.type !== "blur") return null;
  return hitSelectionHandle(
    selectionFrameBounds(annotationCanvas(), annotationItemBounds(item)),
    point,
    annotationCanvas(),
    12
  );
}

function distanceToSegment(point, start, end) {
  const dx = end.x - start.x;
  const dy = end.y - start.y;
  const lengthSquared = dx * dx + dy * dy;
  if (!lengthSquared) return Math.hypot(point.x - start.x, point.y - start.y);
  let ratio = ((point.x - start.x) * dx + (point.y - start.y) * dy) / lengthSquared;
  ratio = Math.max(0, Math.min(1, ratio));
  return Math.hypot(point.x - (start.x + ratio * dx), point.y - (start.y + ratio * dy));
}

function pointInAnnotationItem(item, point) {
  if (item.type === "number") {
    return Math.hypot(point.x - item.x, point.y - item.y) <=
      annotationNumberSize(item) / 2 + canvasDisplayUnit(annotationCanvas());
  }
  if (item.type === "pen") {
    const points = item.points || [];
    const tolerance = (Number(item.lineWidth) || 6) / 2 + canvasDisplayUnit(annotationCanvas()) * 2;
    if (!points.length) return false;
    if (points.length === 1) {
      return Math.hypot(point.x - points[0].x, point.y - points[0].y) <= tolerance;
    }
    for (let index = 1; index < points.length; index++) {
      if (distanceToSegment(point, points[index - 1], points[index]) <= tolerance) return true;
    }
    return false;
  }
  if (item.type === "magnifier") {
    const margin = magnifierStrokeMargin(item) + canvasDisplayUnit(annotationCanvas());
    if (Math.hypot(point.x - item.lensX, point.y - item.lensY) <= item.lensRadius + margin) {
      return true;
    }
    return Math.hypot(point.x - item.sourceX, point.y - item.sourceY) <= item.sourceRadius + margin;
  }
  const bounds = selectionFrameBounds(annotationCanvas(), {
    x: item.x,
    y: item.y,
    width: item.width,
    height: item.height,
  });
  return point.x >= bounds.x && point.x <= bounds.x + bounds.width &&
    point.y >= bounds.y && point.y <= bounds.y + bounds.height;
}

function magnifierPartAtPoint(item, point) {
  if (Math.hypot(point.x - item.lensX, point.y - item.lensY) <= item.lensRadius) return "lens";
  if (Math.hypot(point.x - item.sourceX, point.y - item.sourceY) <= item.sourceRadius) return "source";
  return null;
}

function annotationPointerDown(event) {
  if (!annotationState.image || event.button > 0) return;
  if (event.target.closest?.(".annotation-number-inline-editor")) return;
  if (annotationState.editingNumberId !== null) closeAnnotationNumberInlineEditor(true);
  annotationState.snapGuides = emptySnapGuides();
  const canvas = annotationCanvas();
  const point = annotationPointerPosition(event);
  const existingAtPoint = [...annotationState.items]
    .reverse()
    .find(candidate => pointInAnnotationItem(candidate, point));
  const existingPart = existingAtPoint?.type === "magnifier"
    ? magnifierPartAtPoint(existingAtPoint, point)
    : null;
  if (["number", "mask", "blur", "magnifier", "pen"].includes(annotationState.mode) && existingAtPoint) {
    annotationState.mode = "view";
    annotationStatusText("已点中现有标注，并自动切换到查看模式。");
  }
  if (annotationState.mode === "number") {
    addAnnotationNumberAt(point);
    annotationStage().focus();
    event.preventDefault();
    return;
  }
  if (annotationState.mode === "pen") {
    const item = {
      id: annotationState.nextId++,
      type: "pen",
      points: [{ x: point.x, y: point.y }],
      color: annotationState.penColor || "#ff5a52",
      lineWidth: annotationState.penWidth || 6,
      shadow: Boolean(annotationState.shadows.pen),
    };
    annotationState.items.push(item);
    // 绘制中不显示选择框，避免刚落笔就遮住笔触；松手后再选中成品。
    annotationState.selectedId = null;
    annotationState.selectedIds = [];
    annotationState.selectedPart = null;
    annotationState.interaction = {
      mode: "draw-pen",
      id: item.id,
    };
    annotationStage().setPointerCapture?.(event.pointerId);
    annotationStage().focus();
    updateAnnotationControls();
    renderAnnotationCanvas();
    event.preventDefault();
    return;
  }
  if (annotationState.mode === "mask" || annotationState.mode === "blur") {
    const item = {
      id: annotationState.nextId++,
      type: annotationState.mode,
      x: point.x,
      y: point.y,
      width: 0,
      height: 0,
      ...(annotationState.mode === "blur"
        ? {
            strength: annotationState.blurStrength || 6,
            shadow: Boolean(annotationState.shadows.blur),
          }
        : {
            color: annotationState.maskColor || "#98b2c0",
            shadow: Boolean(annotationState.shadows.mask),
            round: Boolean(annotationState.maskRound),
            cornerRadius: annotationState.maskRoundRadius || 16,
          }),
    };
    annotationState.items.push(item);
    annotationState.selectedId = item.id;
    annotationState.selectedIds = [];
    annotationState.selectedPart = null;
    annotationState.interaction = {
      mode: "create",
      id: item.id,
      start: point,
      original: { ...item },
    };
    annotationStage().setPointerCapture?.(event.pointerId);
    annotationStage().focus();
    updateAnnotationControls();
    renderAnnotationCanvas();
    event.preventDefault();
    return;
  }
  if (annotationState.mode === "magnifier") {
    const item = {
      id: annotationState.nextId++,
      type: "magnifier",
      sourceX: point.x,
      sourceY: point.y,
      sourceRadius: 0,
      lensX: point.x,
      lensY: point.y,
      lensRadius: 0,
      color: annotationState.magnifierColor || ANNOTATION_MAGNIFIER_COLOR,
      lineWidth: annotationState.magnifierWidth || ANNOTATION_MAGNIFIER_LINE_WIDTH,
      shadow: Boolean(annotationState.shadows.magnifier),
    };
    annotationState.items.push(item);
    annotationState.selectedId = item.id;
    annotationState.selectedIds = [];
    annotationState.selectedPart = "source";
    annotationState.interaction = {
      mode: "create-magnifier",
      id: item.id,
      start: point,
      original: { ...item },
    };
    annotationStage().setPointerCapture?.(event.pointerId);
    annotationStage().focus();
    updateAnnotationControls();
    renderAnnotationCanvas();
    event.preventDefault();
    return;
  }
  if (annotationState.mode === "view" && !existingAtPoint && annotationState.zoom > 1.001) {
    const stage = annotationStage();
    annotationState.selectedId = null;
    annotationState.selectedIds = [];
    annotationState.selectedPart = null;
    annotationState.interaction = {
      mode: "pan-canvas",
      startClient: { x: event.clientX, y: event.clientY },
      startScroll: { left: stage.scrollLeft, top: stage.scrollTop },
    };
    setAnnotationCursor("grabbing");
    annotationStage().setPointerCapture?.(event.pointerId);
    stage.focus();
    updateAnnotationControls();
    renderAnnotationCanvas();
    event.preventDefault();
    return;
  }
  const selectedItems = selectedAnnotationItems();
  const multiKey = event.metaKey || event.ctrlKey;
  if (multiKey) {
    const item = existingAtPoint ||
      [...annotationState.items].reverse().find(candidate => pointInAnnotationItem(candidate, point));
    if (item) {
      const ids = new Set(selectedItems.map(candidate => candidate.id));
      const adding = !ids.has(item.id);
      if (adding) ids.add(item.id);
      else ids.delete(item.id);
      annotationState.selectedIds = [...ids];
      annotationState.selectedId = adding ? item.id : (annotationState.selectedIds.at(-1) ?? null);
      const primaryItem = annotationState.items.find(candidate => candidate.id === annotationState.selectedId);
      annotationState.selectedPart = primaryItem?.type === "magnifier"
        ? (adding && primaryItem.id === item.id ? magnifierPartAtPoint(item, point) : null)
        : null;
      const updatedSelection = selectedAnnotationItems();
      annotationState.interaction = adding ? {
        mode: updatedSelection.length > 1 ? "move-group" : "move",
        id: item.id,
        part: item.type === "magnifier" ? magnifierPartAtPoint(item, point) : null,
        start: point,
        original: { ...item },
        originals: updatedSelection.map(candidate => ({ ...candidate })),
      } : null;
    } else {
      annotationState.interaction = null;
      annotationState.selectedPart = null;
    }
    annotationStage().setPointerCapture?.(event.pointerId);
    annotationStage().focus();
    updateAnnotationControls();
    renderAnnotationCanvas();
    event.preventDefault();
    return;
  }
  const handleTarget = [...selectedItems]
    .reverse()
    .map(candidate => ({ item: candidate, handle: hitAnnotationHandle(candidate, point) }))
    .find(candidate => candidate.handle);
  if (handleTarget) {
    annotationState.selectedId = handleTarget.item.id;
    annotationState.selectedIds = [];
    annotationState.selectedPart = handleTarget.item.type === "magnifier"
      ? handleTarget.handle.split("-")[1]
      : null;
    const magnifierHandle = handleTarget.item.type === "magnifier"
      ? handleTarget.handle.split("-")[2]
      : null;
    annotationState.interaction = {
      mode: handleTarget.item.type === "magnifier"
        ? "resize-magnifier"
        : handleTarget.item.type === "number"
          ? "resize-number"
          : "resize",
      id: handleTarget.item.id,
      handle: handleTarget.item.type === "magnifier"
        ? `magnifier-${annotationState.selectedPart}`
        : handleTarget.handle,
      resizeHandle: magnifierHandle,
      start: point,
      original: { ...handleTarget.item },
    };
  } else {
    const item = existingAtPoint ||
      [...annotationState.items].reverse().find(candidate => pointInAnnotationItem(candidate, point));
    const clickedPart = item?.type === "magnifier"
      ? magnifierPartAtPoint(item, point)
      : null;
    const movingSelection = item && selectedItems.some(candidate => candidate.id === item.id);
    if (!movingSelection) {
      annotationState.selectedId = item?.id ?? null;
      annotationState.selectedIds = [];
    }
    annotationState.selectedPart = clickedPart;
    if (item) {
      const itemIndex = annotationState.items.findIndex(candidate => candidate.id === item.id);
      if (itemIndex >= 0 && itemIndex < annotationState.items.length - 1) {
        annotationState.items.splice(itemIndex, 1);
        annotationState.items.push(item);
      }
    }
    annotationState.interaction = item ? {
      mode: movingSelection && selectedItems.length > 1 ? "move-group" : "move",
      id: item.id,
      part: clickedPart,
      start: point,
      original: { ...item },
      originals: movingSelection
        ? selectedItems.map(candidate => ({ ...candidate }))
        : null,
    } : null;
  }
  annotationStage().setPointerCapture?.(event.pointerId);
  annotationStage().focus();
  updateAnnotationControls();
  renderAnnotationCanvas();
  event.preventDefault();
}

function moveAnnotationItem(item, interaction, point) {
  const dx = point.x - interaction.start.x;
  const dy = point.y - interaction.start.y;
  if (item.type === "magnifier") {    const part = interaction.part || "lens";
    const xKey = part === "source" ? "sourceX" : "lensX";
    const yKey = part === "source" ? "sourceY" : "lensY";
    item[xKey] = interaction.original[xKey] + dx;
    item[yKey] = interaction.original[yKey] + dy;
    clampAnnotationItem(item);
    const bounds = magnifierVisualBounds(item, part);
    const snapped = snapBoundsToCanvas(bounds, annotationCanvas(), 10, true);
    item[xKey] += snapped.x - bounds.x;
    item[yKey] += snapped.y - bounds.y;
    clampAnnotationItem(item);
    annotationState.snapGuides = snapped.guides;
    return;
  }
  if (item.type === "pen") {
    item.points = (interaction.original.points || []).map(original => ({
      x: original.x + dx,
      y: original.y + dy,
    }));
    clampAnnotationItem(item);
    const canvas = annotationCanvas();
    const bounds = selectionFrameBounds(canvas, annotationItemBounds(item));
    const snapped = snapBoundsToCanvas(bounds, canvas, 10, true);
    const offsetX = snapped.x - bounds.x;
    const offsetY = snapped.y - bounds.y;
    if (offsetX || offsetY) {
      item.points = item.points.map(penPoint => ({ x: penPoint.x + offsetX, y: penPoint.y + offsetY }));
    }
    annotationState.snapGuides = snapped.guides;
    return;
  }
  item.x = interaction.original.x + dx;
  item.y = interaction.original.y + dy;
  clampAnnotationItem(item);
  const canvas = annotationCanvas();
  const bounds = selectionFrameBounds(canvas, annotationItemBounds(item));
  const snapped = snapBoundsToCanvas(bounds, canvas, 10, true);
  const offsetX = snapped.x - bounds.x;
  const offsetY = snapped.y - bounds.y;
  item.x += offsetX;
  item.y += offsetY;
  annotationState.snapGuides = snapped.guides;
}

function translateAnnotationItem(item, original, dx, dy) {
  if (item.type === "magnifier") {
    item.sourceX = original.sourceX + dx;
    item.sourceY = original.sourceY + dy;
    item.lensX = original.lensX + dx;
    item.lensY = original.lensY + dy;
  } else if (item.type === "pen") {
    item.points = (original.points || []).map(point => ({ x: point.x + dx, y: point.y + dy }));
  } else {
    item.x = original.x + dx;
    item.y = original.y + dy;
  }
}

function resizeAnnotationMagnifier(item, interaction, point) {
  const source = interaction.handle === "magnifier-source";
  const xKey = source ? "sourceX" : "lensX";
  const yKey = source ? "sourceY" : "lensY";
  const radiusKey = source ? "sourceRadius" : "lensRadius";
  const canvas = annotationCanvas();
  const minimumRadius = Math.min(20, canvas.width / 4, canvas.height / 4);
  const edgeMargin = magnifierStrokeMargin(item);
  const maximumRadius = Math.max(
    minimumRadius,
    Math.min(
      interaction.original[xKey] - edgeMargin,
      canvas.width - interaction.original[xKey] - edgeMargin,
      interaction.original[yKey] - edgeMargin,
      canvas.height - interaction.original[yKey] - edgeMargin
    )
  );
  const margin = magnifierSelectionMargin(item);
  const candidateRadius = interaction.resizeHandle
    ? Math.max(Math.abs(point.x - interaction.original[xKey]), Math.abs(point.y - interaction.original[yKey])) - margin
    : Math.hypot(point.x - interaction.original[xKey], point.y - interaction.original[yKey]);
  item[radiusKey] = Math.max(
    minimumRadius,
    Math.min(maximumRadius, candidateRadius)
  );
  clampAnnotationItem(item);
  annotationState.snapGuides = emptySnapGuides();
}

function resizeAnnotationNumber(item, interaction, point) {
  const canvas = annotationCanvas();
  const maximum = Math.max(40, Math.min(240, canvas.width, canvas.height));
  const outset = annotationShadowOutset(item);
  const size = Math.max(
    40,
    Math.min(
      maximum,
      Math.max(0, Math.max(Math.abs(point.x - item.x), Math.abs(point.y - item.y)) - outset) * 2
    )
  );
  annotationState.numberSize = Math.round(size / 2) * 2;
  annotationState.items
    .filter(candidate => candidate.type === "number")
    .forEach(candidate => {
      candidate.size = annotationState.numberSize;
      clampAnnotationItem(candidate);
    });
  annotationControl("NumberSize").value = String(annotationState.numberSize);
  annotationControl("NumberSizeValue").textContent = `${annotationState.numberSize}px`;
  annotationState.snapGuides = emptySnapGuides();
}

function resizeAnnotationMask(item, interaction, point, event) {
  const canvas = annotationCanvas();
  const outset = annotationShadowOutset(item);
  point = {
    x: point.x + (interaction.handle.includes("w") ? outset : interaction.handle.includes("e") ? -outset : 0),
    y: point.y + (interaction.handle.includes("n") ? outset : interaction.handle.includes("s") ? -outset : 0),
  };
  const rect = canvas.getBoundingClientRect();
  const toleranceX = 10 * canvas.width / Math.max(1, rect.width);
  const toleranceY = 10 * canvas.height / Math.max(1, rect.height);
  const xSnap = interaction.handle.includes("w") || interaction.handle.includes("e")
    ? nearestSnap(point.x, [0, canvas.width / 2, canvas.width], toleranceX)
    : null;
  const ySnap = interaction.handle.includes("n") || interaction.handle.includes("s")
    ? nearestSnap(point.y, [0, canvas.height / 2, canvas.height], toleranceY)
    : null;
  point = {
    x: xSnap?.value ?? point.x,
    y: ySnap?.value ?? point.y,
  };
  annotationState.snapGuides = {
    vertical: xSnap ? [xSnap.value] : [],
    horizontal: ySnap ? [ySnap.value] : [],
  };
  const resized = resizeBoundsWithModifiers(interaction.original, interaction.handle, point, {
    minWidth: 2,
    minHeight: 2,
    preserveAspect: event.shiftKey,
    centered: event.altKey || event.ctrlKey,
  });
  Object.assign(item, resized);
  clampAnnotationItem(item);
}

function annotationPointerMove(event) {
  if (annotationState.host === "bg") updateBgAnnotationPenCursor(event);
  const interaction = annotationState.interaction;
  if (!interaction) {
    if (!annotationState.image) return;
    if (["number", "mask", "blur", "magnifier", "pen"].includes(annotationState.mode)) {
      setAnnotationCursor(annotationState.host === "bg" && annotationState.mode === "pen" ? "none" : "crosshair");
      return;
    }
    const point = annotationPointerPosition(event);
    const selectedItems = selectedAnnotationItems();
    const handle = [...selectedItems]
      .reverse()
      .map(item => hitAnnotationHandle(item, point))
      .find(Boolean);
    const cursorHandle = handle?.startsWith("magnifier-") ? handle.split("-").at(-1) : handle;
    const itemAtPoint = [...annotationState.items].reverse().find(item => pointInAnnotationItem(item, point));
    setAnnotationCursor(
      selectionCursorByHandle[cursorHandle] ||
      (itemAtPoint ? "move" : annotationState.zoom > 1.001 ? "grab" : "default")
    );
    return;
  }
  if (interaction.mode === "pan-canvas") {
    const stage = annotationStage();
    stage.scrollLeft = interaction.startScroll.left - (event.clientX - interaction.startClient.x);
    stage.scrollTop = interaction.startScroll.top - (event.clientY - interaction.startClient.y);
    event.preventDefault();
    return;
  }
  const item = annotationState.items.find(candidate => candidate.id === interaction.id);
  if (!item) return;
  let point = annotationPointerPosition(event);
  if (interaction.mode === "create") {
    const canvas = annotationCanvas();
    const rect = canvas.getBoundingClientRect();
    const xSnap = nearestSnap(
      point.x,
      [0, canvas.width / 2, canvas.width],
      10 * canvas.width / Math.max(1, rect.width)
    );
    const ySnap = nearestSnap(
      point.y,
      [0, canvas.height / 2, canvas.height],
      10 * canvas.height / Math.max(1, rect.height)
    );
    point = {
      x: xSnap?.value ?? point.x,
      y: ySnap?.value ?? point.y,
    };
    annotationState.snapGuides = {
      vertical: xSnap ? [xSnap.value] : [],
      horizontal: ySnap ? [ySnap.value] : [],
    };
    const selection = selectionFromPoints(interaction.start, point, event.shiftKey);
    Object.assign(item, selection);
  } else if (interaction.mode === "draw-pen") {
    const lastPoint = item.points[item.points.length - 1];
    if (!lastPoint || Math.hypot(point.x - lastPoint.x, point.y - lastPoint.y) >= 1.5) {
      item.points.push({ x: point.x, y: point.y });
    }
    annotationState.snapGuides = emptySnapGuides();
  } else if (interaction.mode === "create-magnifier") {
    const sourceRadius = Math.hypot(point.x - interaction.start.x, point.y - interaction.start.y);
    item.sourceX = interaction.start.x;
    item.sourceY = interaction.start.y;
    item.sourceRadius = sourceRadius;
    item.lensRadius = 0;
    annotationState.snapGuides = emptySnapGuides();
  } else if (interaction.mode === "move-group") {
    const dx = point.x - interaction.start.x;
    const dy = point.y - interaction.start.y;
    interaction.originals.forEach(original => {
      const candidate = annotationState.items.find(item => item.id === original.id);
      if (!candidate) return;
      translateAnnotationItem(candidate, original, dx, dy);
    });
    const canvas = annotationCanvas();
    const bounds = selectionFrameBounds(canvas, annotationSelectionBounds());
    const snapped = snapBoundsToCanvas(bounds, canvas, 10, true);
    const offsetX = snapped.x - bounds.x;
    const offsetY = snapped.y - bounds.y;
    selectedAnnotationItems().forEach(candidate => {
      const translated = { ...candidate };
      translateAnnotationItem(candidate, translated, offsetX, offsetY);
      clampAnnotationItem(candidate);
    });
    annotationState.snapGuides = snapped.guides;
  } else if (interaction.mode === "move") {
    moveAnnotationItem(item, interaction, point);
  } else if (interaction.mode === "resize-magnifier") {
    resizeAnnotationMagnifier(item, interaction, point);
  } else if (interaction.mode === "resize-number") {
    resizeAnnotationNumber(item, interaction, point);
  } else {
    resizeAnnotationMask(item, interaction, point, event);
  }
  if (annotationState.host === "bg") expandTransparentBlueBgCanvas();
  renderAnnotationCanvas();
  event.preventDefault();
}

function annotationPointerUp(event) {
  if (!annotationState.interaction) return;
  const interaction = annotationState.interaction;
  const snapped = annotationState.snapGuides.vertical.length || annotationState.snapGuides.horizontal.length;
  annotationState.interaction = null;
  annotationStage().releasePointerCapture?.(event.pointerId);
  annotationState.snapGuides = emptySnapGuides();
  if (interaction.mode === "pan-canvas") {
    setAnnotationCursor(annotationState.zoom > 1.001 ? "grab" : "default");
    annotationStatusText(`查看模式 · 画布缩放 ${Math.round(annotationState.zoom * 100)}%`);
    return;
  }
  if (interaction.mode === "draw-pen") {
    const item = annotationState.items.find(candidate => candidate.id === interaction.id);
    if (!item || !item.points.length) {
      annotationState.items = annotationState.items.filter(candidate => candidate.id !== interaction.id);
      renderAnnotationCanvas();
      updateAnnotationControls();
      return;
    }
    // 单击（未拖动）也保留一个圆点笔迹。
    if (item.points.length === 1) {
      item.points.push({ x: item.points[0].x + 0.01, y: item.points[0].y });
    }
    clampAnnotationItem(item);
    annotationState.selectedId = item.id;
    annotationState.selectedIds = [];
    annotationState.selectedPart = null;
    finishAnnotationChange("已添加画笔标注");
    event.preventDefault();
    return;
  }
  if (interaction.mode === "create") {
    const item = annotationState.items.find(candidate => candidate.id === interaction.id);
    if (!item || item.width < 2 || item.height < 2) {
      annotationState.items = annotationState.items.filter(candidate => candidate.id !== interaction.id);
      annotationState.selectedId = null;
      annotationState.selectedIds = [];
      annotationState.selectedPart = null;
      renderAnnotationCanvas();
      updateAnnotationControls();
      annotationStatusText("框选范围太小，未创建标注；当前创建模式保持不变。");
      return;
    }
    clampAnnotationItem(item);
  } else if (interaction.mode === "create-magnifier") {
    const item = annotationState.items.find(candidate => candidate.id === interaction.id);
    if (!item || item.sourceRadius < 8) {
      annotationState.items = annotationState.items.filter(candidate => candidate.id !== interaction.id);
      annotationState.selectedId = null;
      annotationState.selectedIds = [];
      annotationState.selectedPart = null;
      renderAnnotationCanvas();
      updateAnnotationControls();
      annotationStatusText("放大范围太小，未创建放大镜；当前创建模式保持不变。");
      return;
    }
    item.lensRadius = Math.max(80, item.sourceRadius * 2);
    const gap = Math.max(28, item.lineWidth * 3);
    const diagonal = (item.sourceRadius + item.lensRadius + gap) / Math.sqrt(2);
    item.lensX = item.sourceX + diagonal;
    item.lensY = item.sourceY + diagonal;
    clampAnnotationItem(item);
  }
  renderAnnotationCanvas();
  pushAnnotationHistory();
  updateAnnotationControls();
  annotationStatusText(`共 ${annotationState.items.length} 个标注 · ${snapped ? "已吸附到图像或画布参考线" : "已保存当前调整"}`);
}

function setAnnotationZoomAtPoint(nextZoom, clientX, clientY) {
  const canvas = annotationCanvas();
  const stage = annotationStage();
  const before = canvas.getBoundingClientRect();
  const relativeX = before.width ? Math.max(0, Math.min(1, (clientX - before.left) / before.width)) : 0.5;
  const relativeY = before.height ? Math.max(0, Math.min(1, (clientY - before.top) / before.height)) : 0.5;
  applyAnnotationZoom(nextZoom);
  const after = canvas.getBoundingClientRect();
  stage.scrollLeft += after.left + relativeX * after.width - clientX;
  stage.scrollTop += after.top + relativeY * after.height - clientY;
  annotationStatusText(`画布缩放 ${Math.round(annotationState.zoom * 100)}% · 共 ${annotationState.items.length} 个标注`);
}

function annotationWheel(event) {
  if (!annotationState.image || !event.ctrlKey) return;
  event.preventDefault();
  const factor = Math.exp(-event.deltaY * 0.01);
  setAnnotationZoomAtPoint(annotationState.zoom * factor, event.clientX, event.clientY);
}

function annotationGestureStart(event) {
  if (!annotationState.image) return;
  event.preventDefault();
  annotationState.gestureStartZoom = annotationState.zoom;
}

function annotationGestureChange(event) {
  if (!annotationState.image) return;
  event.preventDefault();
  setAnnotationZoomAtPoint(
    annotationState.gestureStartZoom * event.scale,
    event.clientX,
    event.clientY
  );
}

function annotationStateForHost(host) {
  return host === "bg" ? bgAnnotationState : nativeAnnotationState;
}

function ensureAnnotationNumberInlineEditor(host = annotationState.host) {
  const stage = host === "bg" ? $("#blueBgStage") : $("#annotationStage");
  let input = stage.querySelector(".annotation-number-inline-editor");
  if (input) return input;
  input = document.createElement("input");
  input.type = "text";
  input.inputMode = "numeric";
  input.pattern = "[0-9]*";
  input.className = "annotation-number-inline-editor";
  input.setAttribute("aria-label", "编辑序号数字");
  input.dataset.annotationHost = host;
  input.hidden = true;
  input.onpointerdown = event => event.stopPropagation();
  input.ondblclick = event => event.stopPropagation();
  input.oninput = () => {
    const state = annotationStateForHost(input.dataset.annotationHost);
    withAnnotationState(state, () => {
      const item = state.items.find(candidate => candidate.id === state.editingNumberId);
      const normalized = input.value.trim();
      if (!item || !/^\d+$/.test(normalized) || Number(normalized) < 1) return;
      item.number = Number(normalized);
      state.nextNumber = Math.max(state.nextNumber, item.number + 1);
      updateAnnotationControls();
    });
  };
  input.onkeydown = event => {
    const state = annotationStateForHost(input.dataset.annotationHost);
    if (event.key === "Enter") {
      event.preventDefault();
      withAnnotationState(state, () => closeAnnotationNumberInlineEditor(true));
    } else if (event.key === "Escape") {
      event.preventDefault();
      withAnnotationState(state, () => closeAnnotationNumberInlineEditor(false));
    }
  };
  input.onblur = () => {
    if (input.dataset.closing === "true") return;
    const state = annotationStateForHost(input.dataset.annotationHost);
    withAnnotationState(state, () => closeAnnotationNumberInlineEditor(true));
  };
  stage.appendChild(input);
  return input;
}

function syncAnnotationNumberInlineEditor() {
  const input = ensureAnnotationNumberInlineEditor();
  const item = annotationState.items.find(candidate => candidate.id === annotationState.editingNumberId);
  if (!item || item.type !== "number") {
    input.hidden = true;
    return;
  }
  const canvas = annotationCanvas();
  const stage = annotationStage();
  const canvasRect = canvas.getBoundingClientRect();
  const stageRect = stage.getBoundingClientRect();
  const scaleX = canvasRect.width / Math.max(1, canvas.width);
  const scaleY = canvasRect.height / Math.max(1, canvas.height);
  const size = annotationNumberSize(item);
  const displayWidth = size * scaleX;
  const displayHeight = size * scaleY;
  input.hidden = false;
  input.style.left = `${canvasRect.left - stageRect.left + stage.scrollLeft + (item.x - size / 2) * scaleX}px`;
  input.style.top = `${canvasRect.top - stageRect.top + stage.scrollTop + (item.y - size / 2) * scaleY}px`;
  input.style.width = `${displayWidth}px`;
  input.style.height = `${displayHeight}px`;
  input.style.fontSize = `${displayHeight * (String(item.number).length >= 3 ? 50 / 110 : 70 / 110)}px`;
  input.style.setProperty("--number-color", item.color || "#ff5a52");
}

function openAnnotationNumberInlineEditor(item) {
  annotationState.editingNumberId = item.id;
  annotationState.editingNumberOriginal = item.number;
  const input = ensureAnnotationNumberInlineEditor();
  input.value = String(item.number);
  updateAnnotationControls();
  renderAnnotationCanvas();
  syncAnnotationNumberInlineEditor();
  input.focus();
  input.select();
}

function closeAnnotationNumberInlineEditor(commit) {
  const input = ensureAnnotationNumberInlineEditor();
  const item = annotationState.items.find(candidate => candidate.id === annotationState.editingNumberId);
  if (!item) {
    input.hidden = true;
    annotationState.editingNumberId = null;
    annotationState.editingNumberOriginal = null;
    return;
  }
  const normalized = input.value.trim();
  const valid = /^\d+$/.test(normalized) && Number(normalized) >= 1;
  const original = annotationState.editingNumberOriginal;
  if (commit && valid) item.number = Number(normalized);
  else item.number = original;
  input.dataset.closing = "true";
  input.hidden = true;
  annotationState.editingNumberId = null;
  annotationState.editingNumberOriginal = null;
  delete input.dataset.closing;
  finishAnnotationChange(commit && valid ? `序号已修改为 ${item.number}` : "已取消修改序号");
  annotationStage().focus();
}

function annotationDoubleClick(event) {
  if (!annotationState.image) return;
  const point = annotationPointerPosition(event);
  const item = [...annotationState.items]
    .reverse()
    .find(candidate => candidate.type === "number" && pointInAnnotationItem(candidate, point));
  if (!item) return;
  event.preventDefault();
  annotationState.selectedId = item.id;
  annotationState.selectedIds = [];
  annotationState.selectedPart = null;
  openAnnotationNumberInlineEditor(item);
}

function closeAnnotationNumberEditor() {
  annotationState.editingNumberId = null;
  updateAnnotationControls();
  annotationStage().focus();
}

function confirmAnnotationNumberEdit() {
  const item = annotationState.items.find(candidate => candidate.id === annotationState.editingNumberId);
  if (!item || item.type !== "number") {
    closeAnnotationNumberEditor();
    return;
  }
  const input = annotationControl("NumberInput");
  const normalized = input.value.trim();
  if (!/^\d+$/.test(normalized) || Number(normalized) < 1) {
    annotationStatusText("序号修改失败：请输入大于 0 的整数。");
    input.focus();
    input.select();
    return;
  }
  item.number = Number(normalized);
  annotationState.nextNumber = Math.max(annotationState.nextNumber, item.number + 1);
  annotationState.editingNumberId = null;
  finishAnnotationChange(`序号已修改为 ${item.number}`);
  annotationStage().focus();
}

function annotationKeyDown(event) {
  if (event.key.toLowerCase() === "v" && !event.metaKey && !event.ctrlKey && !event.altKey) {
    event.preventDefault();
    setAnnotationMode("view");
    return;
  }
  if ((event.key === "Delete" || event.key === "Backspace") && selectedAnnotationItems().length) {
    event.preventDefault();
    deleteSelectedAnnotation();
    return;
  }
  const directions = {
    ArrowLeft: [-1, 0],
    ArrowRight: [1, 0],
    ArrowUp: [0, -1],
    ArrowDown: [0, 1],
  };
  const direction = directions[event.key];
  if (!direction) return;
  const selected = selectedAnnotationItems();
  if (!selected.length) return;
  event.preventDefault();
  const step = event.shiftKey ? 10 : 1;
  selected.forEach(item => {
    const original = { ...item };
    translateAnnotationItem(item, original, direction[0] * step, direction[1] * step);
    clampAnnotationItem(item);
  });
  pushAnnotationHistory();
  renderAnnotationCanvas();
  annotationStatusText(`已微调 ${step}px · 共 ${annotationState.items.length} 个标注`);
}

function exportAnnotationImage() {
  if (!annotationState.image) return;
  const previewCanvas = annotationCanvas();
  const exportCanvas = document.createElement("canvas");
  exportCanvas.width = previewCanvas.width;
  exportCanvas.height = previewCanvas.height;
  const ctx = exportCanvas.getContext("2d");
  ctx.drawImage(annotationState.image, 0, 0);
  annotationState.items.forEach(item => drawAnnotationItem(ctx, item));
  const normalizedCanvas = canvasScaledToWidth(exportCanvas);
  normalizedCanvas.toBlob(blob => {
    if (!blob) {
      annotationStatusText("导出失败，请重试。");
      return;
    }
    const baseName = annotationState.sourceName.replace(/\.[^.]+$/, "") || "图片";
    downloadBlob(blob, `${baseName}-标注.png`);
    annotationStatusText(`已导出 ${normalizedCanvas.width} × ${normalizedCanvas.height}px · ${baseName}-标注.png`);
  }, "image/png");
}

function normalizeProductNameForMatch(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/\s*[-–—]\s*.*$/, "")
    .replace(/\s+/g, "")
    .trim();
}

async function buttonTitleFromKnownDescription(name) {
  const cleanName = String(name || "").trim();
  if (!cleanName || /\s[-–—]\s/.test(cleanName)) return cleanName;
  if (!state.productDescriptions.length) {
    await loadProductDescriptions();
  }
  const needle = normalizeProductNameForMatch(cleanName);
  const item = state.productDescriptions.find(entry => normalizeProductNameForMatch(entry.name) === needle);
  if (!item) return cleanName;
  if (!item.selectedDescription) return cleanName;
  return item.buttonTitle || `${item.name || cleanName} - ${item.selectedDescription}`;
}

async function makeButtonImage(options = {}) {
  const rawName = $("#appName").value.trim() || "软件名称";
  const name = await buttonTitleFromKnownDescription(rawName);
  if (name !== rawName) {
    $("#appName").value = name;
    $("#productInfoResult").textContent = `已套用短描述：${name}`;
  }
  const iconFile = $("#iconFile").files[0];
  if (!iconFile && !state.productInfo?.iconUrl) throw new Error("请先选择软件图标，或先读取商品详情页");
  const platforms = $$(".platform:checked").map(x => x.value);
  const form = new FormData();
  if (options.preferProductIcon && state.productInfo?.iconUrl) {
    form.append("iconUrl", state.productInfo.iconUrl);
  } else if (iconFile) {
    form.append("icon", iconFile);
  } else if (state.productInfo?.iconUrl) {
    form.append("iconUrl", state.productInfo.iconUrl);
  }
  form.append("appName", name);
  form.append("platforms", platforms.join(","));
  const blob = await fetchBlob("/api/render-button", { method: "POST", body: form });
  const url = URL.createObjectURL(blob);
  const img = $("#buttonPreview");
  $("#buttonPreviewBox").classList.add("has-image");
  const filename = `button-go-${name}.png`;
  img.src = url;
  img.title = `点击下载 ${filename}`;
  img.onclick = () => downloadBlob(blob, filename);
  return { blob, url, filename, name };
}

function splitProductQueries(value) {
  return Array.from(new Set(String(value || "")
    .split(/[\n,，、;；]+/)
    .map(item => item.trim())
    .filter(Boolean)));
}

function renderProductMatches() {
  const target = $("#productMatchList");
  target.innerHTML = state.productMatches.map((match, index) => {
    if (match.status === "not_found") {
      return `<div class="product-match-group"><p class="product-match-title"><strong>${escapeHtml(match.query)}</strong>：未匹配到商品</p></div>`;
    }
    const options = (match.candidates || []).map((candidate, candidateIndex) => `
      <label class="product-match-option">
        <input type="radio" name="product-match-${index}" value="${candidateIndex}"${candidateIndex === 0 ? " checked" : ""}>
        <span><strong>${escapeHtml(candidate.displayName)}</strong><br><span class="muted">${escapeHtml(candidate.catalogTitle)}</span></span>
      </label>`).join("");
    return `<div class="product-match-group" data-match-index="${index}">
      <p class="product-match-title"><strong>${escapeHtml(match.query)}</strong> 匹配到 ${(match.candidates || []).length} 个版本，请选择：</p>
      <div class="product-match-options">${options}</div>
      <button type="button" class="generate-selected-product primary">生成所选版本</button>
    </div>`;
  }).join("");
}

function renderButtonResults() {
  const section = $("#buttonResultsSection");
  const target = $("#buttonResultList");
  section.hidden = state.buttonResults.length === 0;
  $("#buttonResultCount").textContent = `${state.buttonResults.length} 项`;
  target.innerHTML = state.buttonResults.map(item => {
    if (item.error) {
      return `<article class="button-result-card" data-result-id="${item.id}">
        <div class="button-result-info button-result-error"><strong>${escapeHtml(item.query)}</strong><span>${escapeHtml(item.error)}</span></div>
        <div></div><div class="button-result-actions"><button type="button" class="remove-button-result">移除</button></div>
      </article>`;
    }
    return `<article class="button-result-card" data-result-id="${item.id}">
      <img src="${escapeAttr(item.previewUrl)}" alt="${escapeAttr(item.title)}">
      <div class="button-result-info">
        <strong>${escapeHtml(item.title)}</strong>
        <span class="muted">${escapeHtml(item.platformText || "未识别平台")}</span>
        <a href="${escapeAttr(item.url)}" target="_blank" rel="noopener">${escapeHtml(item.url)}</a>
      </div>
      <div class="button-result-actions">
        <button type="button" class="copy-button-result-link">复制链接</button>
        <button type="button" class="download-button-result primary">下载 PNG</button>
        <button type="button" class="remove-button-result">移除</button>
      </div>
    </article>`;
  }).join("");
}

async function generateProductCandidate(candidate, query) {
  try {
    $("#productInfoResult").textContent = `正在生成：${candidate.displayName || candidate.name || query}`;
    const info = await api("/api/product-info", { url: candidate.url });
    applyProductInfo(info);
    $("#productUrl").value = info.siteUrl || info.url || candidate.url;
    const generated = await makeButtonImage({ preferProductIcon: true });
    state.buttonResults.unshift({
      id: ++state.buttonResultId,
      query,
      title: info.buttonTitle || info.appName || candidate.name || query,
      platformText: (info.platforms || []).join(" / "),
      url: info.siteUrl || info.url || candidate.url,
      blob: generated.blob,
      previewUrl: generated.url,
      filename: generated.filename,
    });
    renderButtonResults();
    return true;
  } catch (err) {
    state.buttonResults.unshift({ id: ++state.buttonResultId, query, error: err.message || String(err) });
    renderButtonResults();
    return false;
  }
}

async function searchProductsAndGenerate() {
  const queries = splitProductQueries($("#productKeywords").value);
  if (!queries.length) throw new Error("请先输入软件名或关键词");
  const button = $("#searchProducts");
  button.disabled = true;
  try {
    $("#productInfoResult").textContent = `正在匹配 ${queries.length} 个关键词...`;
    const data = await api("/api/product-search", { queries });
    state.productMatches = (data.results || []).filter(item => item.status !== "matched");
    renderProductMatches();
    let generated = 0;
    for (const match of data.results || []) {
      if (match.status !== "matched" || !match.candidates?.length) continue;
      if (await generateProductCandidate(match.candidates[0], match.query)) generated += 1;
    }
    const ambiguous = state.productMatches.filter(item => item.status === "ambiguous").length;
    const missing = state.productMatches.filter(item => item.status === "not_found").length;
    $("#productInfoResult").textContent = `已生成 ${generated} 项${ambiguous ? `，${ambiguous} 项待选择版本` : ""}${missing ? `，${missing} 项未匹配` : ""}`;
  } finally {
    button.disabled = false;
  }
}

async function generateSelectedProduct(group, button) {
  const index = Number(group.dataset.matchIndex);
  const match = state.productMatches[index];
  const selected = $("input[type=radio]:checked", group);
  const candidate = match?.candidates?.[Number(selected?.value)];
  if (!candidate) throw new Error("请选择要生成的商品版本");
  button.disabled = true;
  try {
    const ok = await generateProductCandidate(candidate, match.query);
    if (ok) {
      state.productMatches.splice(index, 1);
      renderProductMatches();
      $("#productInfoResult").textContent = `已生成：${candidate.displayName}`;
    }
  } finally {
    if (button.isConnected) button.disabled = false;
  }
}

async function fetchProductInfo() {
  const rawUrl = $("#productUrl").value.trim();
  if (!rawUrl) throw new Error("请先输入商品详情页 URL");
  const url = withProductCid(rawUrl);
  $("#productUrl").value = url;
  $("#productInfoResult").textContent = "正在读取商品信息...";
  const info = await api("/api/product-info", { url });
  $("#productUrl").value = info.siteUrl || info.url || url;
  applyProductInfo(info);
  const buttonTitle = info.buttonTitle || info.appName || "软件名称";
  $("#productInfoResult").textContent = `已读取：${buttonTitle} · ${(info.platforms || []).join(" / ") || "未识别平台"}`;
  $("#productInfoResult").textContent = `已读取：${buttonTitle}，正在生成按钮...`;
  await makeButtonImage({ preferProductIcon: true });
  $("#productInfoResult").textContent = `已生成：${buttonTitle} · ${(info.platforms || []).join(" / ") || "未识别平台"}`;
  loadProductDescriptions().catch(err => console.warn(err));
}

function applyProductInfo(info) {
  state.productInfo = info || null;
  if (!info) return;
  $("#appName").value = info.buttonTitle || info.appName || "";
  $$(".platform").forEach(input => {
    input.checked = (info.platforms || []).includes(input.value);
  });
}

async function loadProductDescriptions() {
  const data = await api("/api/product-descriptions");
  state.productDescriptions = data.items || [];
  renderProductDescriptions();
}

function productDescriptionMode(item) {
  return ["auto", "manual", "empty"].includes(item.mode) ? item.mode : "auto";
}

function selectedDescriptionFromCard(card) {
  const mode = $(`input[name="mode-${CSS.escape(card.dataset.key)}"]:checked`, card)?.value || "auto";
  const autoDescription = card.dataset.autoDescription || "";
  const manualDescription = $(".product-description-manual", card)?.value.trim() || "";
  if (mode === "auto") return autoDescription;
  if (mode === "manual") return manualDescription;
  return "";
}

function buttonTitleFromCard(card) {
  const name = card.dataset.name || "软件名称";
  const description = selectedDescriptionFromCard(card);
  return description ? `${name} - ${description}` : name;
}

function draftFromProductDescriptionCard(card) {
  const key = card.dataset.key;
  return {
    key,
    mode: $(`input[name="mode-${CSS.escape(key)}"]:checked`, card)?.value || "auto",
    manualDescription: $(".product-description-manual", card)?.value || "",
  };
}

function applyProductDescriptionDraft(card, draft) {
  if (!card || !draft) return;
  const modeInput = $(`input[name="mode-${CSS.escape(card.dataset.key)}"][value="${draft.mode}"]`, card);
  if (modeInput) modeInput.checked = true;
  const manualInput = $(".product-description-manual", card);
  if (manualInput) manualInput.value = draft.manualDescription || "";
  updateProductDescriptionTitle(card);
}

function updateProductDescriptionTitle(card) {
  const target = $(".product-description-foot strong", card);
  if (target) target.textContent = buttonTitleFromCard(card);
}

function renderProductDescriptions() {
  const list = $("#productDescriptionList");
  const query = ($("#productDescriptionSearch")?.value || "").trim().toLowerCase();
  const pendingOnly = Boolean($("#pendingDescriptionsOnly")?.checked);
  const usedOnly = Boolean($("#usedDescriptionsOnly")?.checked);
  const items = state.productDescriptions.filter(item => {
    if (pendingOnly && item.status !== "pending") return false;
    if (usedOnly && !item.generatedButtonCount) return false;
    if (!query) return true;
    return [
      item.name,
      item.productUrl,
      item.subtitle,
      item.autoDescription,
      item.manualDescription,
      item.suggestedDescription,
      item.selectedDescription,
    ].some(value => String(value || "").toLowerCase().includes(query));
  });
  const pendingItems = items.filter(item => item.status !== "confirmed" && item.status !== "skipped");
  const confirmedItems = items.filter(item => item.status === "confirmed");
  const skippedItems = items.filter(item => item.status === "skipped");
  $("#productDescriptionCount").textContent = `(${items.length}/${state.productDescriptions.length} 款)`;
  if (!items.length) {
    list.innerHTML = '<div class="empty-state">没有匹配的商品短描述记录。</div>';
    return;
  }
  const renderGroup = (title, groupItems) => groupItems.length
    ? `<section class="product-description-group">
        <h3>${title} <span class="muted">(${groupItems.length} 款)</span></h3>
        ${groupItems.map(renderProductDescriptionCard).join("")}
      </section>`
    : "";
  list.innerHTML = [
    renderGroup("待确认", pendingItems),
    renderGroup("已确认", confirmedItems),
    renderGroup("不处理", skippedItems),
  ].filter(Boolean).join("");
}

function renderProductDescriptionCard(item) {
    const mode = productDescriptionMode(item);
    const manualValue = item.manualDescription || item.suggestedDescription || "";
    const effectiveMode = mode === "auto" && !item.autoDescription && manualValue ? "manual" : mode;
    const key = escapeAttr(item.key);
    const radioName = `mode-${key}`;
    const statusMap = { pending: "待确认", confirmed: "已确认", skipped: "不处理" };
    const statusKey = statusMap[item.status] ? item.status : "pending";
    const status = statusMap[statusKey];
    const selectedDescription = effectiveMode === "manual"
      ? manualValue
      : (effectiveMode === "auto" ? item.autoDescription || "" : "");
    const currentTitle = selectedDescription ? `${item.name || "软件名称"} - ${selectedDescription}` : (item.name || "");
    const previewUrl = state.productPreviewUrls.get(item.key) || "";
    const usageText = item.generatedButtonCount
      ? `已生成过 ${item.generatedButtonCount} 次${item.generatedButtonPackages?.length ? ` · ${item.generatedButtonPackages[0]}` : ""}`
      : "未在发布包中发现按钮记录";
    return `<article class="product-description-card" data-key="${key}" data-name="${escapeAttr(item.name || "软件名称")}" data-product-url="${escapeAttr(item.productUrl || "")}" data-auto-description="${escapeAttr(item.autoDescription || "")}" data-icon-url="${escapeAttr(item.iconUrl || "")}" data-platforms="${escapeAttr((item.platforms || []).join(","))}" data-subtitle="${escapeAttr(item.subtitle || "")}">
      <div class="product-description-preview ${previewUrl ? "has-image" : ""}">
        <span>按钮预览</span>
        <img alt="${escapeAttr(item.name || "商品")} 按钮预览" ${previewUrl ? `src="${escapeAttr(previewUrl)}"` : ""}>
      </div>
      <div class="product-description-main">
        <div class="product-description-head">
          <div>
            <h3>${escapeHtml(item.name || "未命名商品")} <span class="status-pill ${statusKey}">${status}</span></h3>
            <a href="${escapeAttr(item.productUrl || "#")}" target="_blank" rel="noopener">${escapeHtml(item.productUrl || "缺少商品链接")}</a>
          </div>
          <div class="product-description-actions">
            <button type="button" class="skip-product-description">不处理</button>
            <button type="button" class="preview-product-description">预览</button>
            <button type="button" class="save-product-description primary">保存</button>
          </div>
        </div>
        <div class="product-description-meta">原始副标题：${escapeHtml(item.subtitle || "无")}</div>
        <div class="product-description-meta">使用记录：${escapeHtml(usageText)}</div>
        <div class="product-description-options">
          <label><input type="radio" name="${radioName}" value="auto" ${effectiveMode === "auto" ? "checked" : ""}> 自动：${escapeHtml(item.autoDescription || "留空")}</label>
          <label><input type="radio" name="${radioName}" value="manual" ${effectiveMode === "manual" ? "checked" : ""}> 手动</label>
          <label><input type="radio" name="${radioName}" value="empty" ${effectiveMode === "empty" ? "checked" : ""}> 留空</label>
        </div>
        <input class="product-description-manual" value="${escapeAttr(manualValue)}" placeholder="手动短描述，例如 菜单栏整理工具">
        <div class="product-description-foot">当前标题：<strong>${escapeHtml(currentTitle || item.buttonTitle || item.name || "")}</strong></div>
      </div>
    </article>`;
}

async function saveProductDescription(card) {
  const key = card.dataset.key;
  const mode = $(`input[name="mode-${CSS.escape(key)}"]:checked`, card)?.value || "auto";
  const payload = {
    key,
    productUrl: card.dataset.productUrl || "",
    name: card.dataset.name || "",
    subtitle: card.dataset.subtitle || "",
    autoDescription: card.dataset.autoDescription || "",
    manualDescription: $(".product-description-manual", card)?.value.trim() || "",
    mode,
    iconUrl: card.dataset.iconUrl || "",
    platforms: (card.dataset.platforms || "").split(",").filter(Boolean),
  };
  const item = await api("/api/product-description-save", payload);
  const idx = state.productDescriptions.findIndex(entry => entry.key === key);
  if (idx >= 0) state.productDescriptions[idx] = item;
  renderProductDescriptions();
  state.productPreviewUrls.delete(key);
  const savedCard = $(`.product-description-card[data-key="${CSS.escape(key)}"]`);
  if (savedCard) {
    $("#productDescriptionResult").textContent = `已保存，正在生成最终预览：${item.buttonTitle || item.name}`;
    await previewProductDescription(savedCard, { useCurrentDraft: false, afterSave: true });
  } else {
    $("#productDescriptionResult").textContent = `已保存：${item.buttonTitle || item.name}`;
  }
}

async function skipProductDescription(card) {
  const key = card.dataset.key;
  const payload = {
    ...draftFromProductDescriptionCard(card),
    productUrl: card.dataset.productUrl || "",
    name: card.dataset.name || "",
    subtitle: card.dataset.subtitle || "",
    autoDescription: card.dataset.autoDescription || "",
    iconUrl: card.dataset.iconUrl || "",
    platforms: (card.dataset.platforms || "").split(",").filter(Boolean),
  };
  const item = await api("/api/product-description-skip", payload);
  const idx = state.productDescriptions.findIndex(entry => entry.key === key);
  if (idx >= 0) state.productDescriptions[idx] = item;
  state.productPreviewUrls.delete(key);
  renderProductDescriptions();
  $("#productDescriptionResult").textContent = `已移入不处理：${item.name || item.productUrl || key}`;
}

async function previewProductDescription(card, options = {}) {
  const useCurrentDraft = options.useCurrentDraft !== false;
  const draft = useCurrentDraft ? draftFromProductDescriptionCard(card) : null;
  let iconUrl = card.dataset.iconUrl || "";
  if (card.dataset.productUrl) {
    $("#productDescriptionResult").textContent = `正在刷新：${card.dataset.name || card.dataset.productUrl || "商品"}...`;
    const data = await api("/api/product-description-add", { url: card.dataset.productUrl || "" });
    const item = data.item || {};
    const idx = state.productDescriptions.findIndex(entry => entry.key === item.key);
    if (idx >= 0) state.productDescriptions[idx] = item;
    renderProductDescriptions();
    card = $(`.product-description-card[data-key="${CSS.escape(item.key || "")}"]`) || card;
    if (draft) applyProductDescriptionDraft(card, draft);
    iconUrl = card.dataset.iconUrl || "";
  }
  if (!iconUrl) throw new Error("这条记录缺少图标 URL，请确认商品链接仍然可访问");
  const platforms = (card.dataset.platforms || "").split(",").filter(Boolean);
  const title = buttonTitleFromCard(card);
  const form = new FormData();
  form.append("iconUrl", iconUrl);
  form.append("appName", title);
  form.append("platforms", platforms.join(","));
  const blob = await fetchBlob("/api/render-button", { method: "POST", body: form });
  const img = $(".product-description-preview img", card);
  $(".product-description-preview", card).classList.add("has-image");
  const url = URL.createObjectURL(blob);
  state.productPreviewUrls.set(card.dataset.key, url);
  img.src = url;
  img.title = title;
  updateProductDescriptionTitle(card);
  $("#productDescriptionResult").textContent = options.afterSave ? `已保存并更新最终预览：${title}` : `已预览：${title}`;
}

async function addProductDescriptionFromUrl() {
  const input = $("#productDescriptionUrl");
  const url = withProductCid(input.value.trim());
  if (!url) throw new Error("请输入商品详情页 URL");
  $("#productDescriptionResult").textContent = "正在读取商品信息...";
  const data = await api("/api/product-description-add", { url });
  input.value = "";
  await loadProductDescriptions();
  $("#productDescriptionResult").textContent = `已添加：${data.item?.buttonTitle || data.item?.name || url}`;
}

async function scanProductDescriptions() {
  $("#productDescriptionResult").textContent = "正在检查新上架商品...";
  const data = await api("/api/product-description-scan", { limit: 30 });
  state.productDescriptions = data.items || [];
  renderProductDescriptions();
  const errorText = data.errors?.length ? `，失败 ${data.errors.length} 个` : "";
  $("#productDescriptionResult").textContent = `发现链接 ${data.found || 0} 个，新增 ${data.added?.length || 0} 款${errorText}`;
}

async function previewTopProductDescriptions() {
  const cards = $$(".product-description-group:first-of-type .product-description-card")
    .filter(card => !state.productPreviewUrls.has(card.dataset.key))
    .slice(0, 10);
  if (!cards.length) {
    $("#productDescriptionResult").textContent = "当前待确认列表没有需要生成预览的商品。";
    return;
  }
  let done = 0;
  let failed = 0;
  let attempted = 0;
  for (const card of cards) {
    attempted += 1;
    $("#productDescriptionResult").textContent = `正在批量预览 ${attempted}/${cards.length}：${card.dataset.name || card.dataset.key}`;
    try {
      await previewProductDescription(card);
      done += 1;
    } catch (err) {
      failed += 1;
      console.warn("preview product description failed", card.dataset.productUrl || card.dataset.key, err);
      $("#productDescriptionResult").textContent = `已跳过：${card.dataset.name || card.dataset.key}（${err.message || err}）`;
    }
  }
  $("#productDescriptionResult").textContent = `已生成 ${done} 款预览${failed ? `，跳过 ${failed} 款` : ""}。`;
}

async function scanProductQr() {
  const file = $("#productQrFile").files[0];
  if (!file) throw new Error("请先选择包含二维码的商品卡片图");
  if (!("BarcodeDetector" in window)) {
    throw new Error("当前浏览器不支持二维码识别，请直接粘贴商品详情页 URL");
  }
  $("#productInfoResult").textContent = "正在识别二维码...";
  const bitmap = await createImageBitmap(file);
  const detector = new BarcodeDetector({ formats: ["qr_code"] });
  const codes = await detector.detect(bitmap);
  const value = codes[0]?.rawValue || "";
  if (!value) throw new Error("没有识别到二维码，请换一张更清晰的商品卡片图");
  $("#productUrl").value = value;
  $("#productInfoResult").textContent = "二维码已识别，正在读取商品信息...";
  await fetchProductInfo();
}

function loadImage(file) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = URL.createObjectURL(file);
  });
}

function downloadBlob(blob, filename) {
  const a = document.createElement("a");
  a.download = filename;
  a.href = URL.createObjectURL(blob);
  a.click();
}

function escapeHtml(text) {
  return String(text).replace(/[&<>"']/g, ch => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[ch]));
}

function escapeAttr(text) {
  return escapeHtml(text || "");
}

const distributionStatusLabels = {
  pending: "未同步",
  synced: "已同步",
  skipped: "不同步",
};
let distributionScrollAnchors = [];
let distributionAnchorFrame = 0;
let distributionScrollFrame = 0;
let distributionSyncedElement = null;
let distributionSyncedUntil = 0;

function distributionAnchorKey(element) {
  const imageAlt = element.querySelector("img")?.alt || "";
  let text = `${element.textContent || ""} ${imageAlt}`.normalize("NFKC");
  if (
    /搜索「数码荔枝」或访问网站\s+lizhi\.shop/i.test(text)
    || /请在「数码荔枝」搜索软件名/.test(text)
    || /(?:本文|原文).*(?:首发|原发|发布|刊载|原载)于.*(?:微信公众号|微信公众平台|数码荔枝)/i.test(text)
  ) {
    return "";
  }
  text = text
    .replace(/(?:数码荔枝|荔枝)(?:正版)?(?:软件)?(?:商店|商城)/gi, "数码荔枝")
    .replace(/https?:\/\//gi, "")
    .replace(/[\s，。；：、,.!?！？"'“”‘’（）()[\]【】<>《》—_\-]+/g, "")
    .toLowerCase();
  if (!text) return "";
  const kind = /^H[1-6]$/.test(element.tagName)
    ? "heading"
    : element.tagName === "FIGURE"
      ? "figure"
      : element.tagName === "LI"
        ? "item"
        : "paragraph";
  return `${kind}:${text.slice(0, 240)}`;
}

function distributionAnchorElements(preview) {
  return $$("h1,h2,h3,h4,h5,h6,p,li,figure", preview).filter(element => {
    const parentBlock = element.parentElement?.closest("p,li,figure");
    return !parentBlock || !preview.contains(parentBlock);
  });
}

function distributionElementMetrics(element, scroller) {
  const scrollerRect = scroller.getBoundingClientRect();
  const rect = element.getBoundingClientRect();
  const offset = scroller.scrollTop - scrollerRect.top;
  const lineRects = [];
  const range = document.createRange();
  range.selectNodeContents(element);
  Array.from(range.getClientRects()).forEach(lineRect => {
    if (!lineRect.width && !lineRect.height) return;
    const last = lineRects.at(-1);
    if (last && Math.abs(last.top - lineRect.top) < 2) {
      last.bottom = Math.max(last.bottom, lineRect.bottom);
    } else {
      lineRects.push({ top: lineRect.top, bottom: lineRect.bottom });
    }
  });
  return {
    top: rect.top + offset,
    bottom: rect.bottom + offset,
    lines: lineRects.map(line => ((line.top + line.bottom) / 2) + offset),
  };
}

function distributionElementBounds(element, scroller) {
  const scrollerRect = scroller.getBoundingClientRect();
  const rect = element.getBoundingClientRect();
  const offset = scroller.scrollTop - scrollerRect.top;
  return {
    top: rect.top + offset,
    bottom: rect.bottom + offset,
  };
}

function addDistributionMetricPairs(points, originalMetric, optimizedMetric) {
  points.push({ original: originalMetric.top, optimized: optimizedMetric.top });
  if (originalMetric.lines.length && optimizedMetric.lines.length) {
    originalMetric.lines.forEach((position, index) => {
      const denominator = Math.max(1, originalMetric.lines.length - 1);
      const targetIndex = Math.round((index / denominator) * Math.max(0, optimizedMetric.lines.length - 1));
      points.push({ original: position, optimized: optimizedMetric.lines[targetIndex] });
    });
  }
  points.push({ original: originalMetric.bottom, optimized: optimizedMetric.bottom });
}

function rebuildDistributionScrollAnchors() {
  distributionAnchorFrame = 0;
  const grid = $(".distribution-grid");
  const originalScroller = $(".distribution-original");
  const optimizedScroller = $(".distribution-optimized");
  const originalPreview = $("#distributionOriginalPreview");
  const optimizedPreview = $("#distributionOptimizedPreview");
  if (!grid || getComputedStyle(grid).display !== "grid" || !originalPreview || !optimizedPreview) {
    distributionScrollAnchors = [];
    return;
  }

  const optimizedByKey = new Map();
  distributionAnchorElements(optimizedPreview).forEach(element => {
    const key = distributionAnchorKey(element);
    if (!key) return;
    if (!optimizedByKey.has(key)) optimizedByKey.set(key, []);
    optimizedByKey.get(key).push(element);
  });

  const pairs = [];
  distributionAnchorElements(originalPreview).forEach(originalElement => {
    const key = distributionAnchorKey(originalElement);
    const matches = key ? optimizedByKey.get(key) : null;
    const optimizedElement = matches?.shift();
    if (optimizedElement) pairs.push([originalElement, optimizedElement]);
  });

  const originalBounds = distributionElementBounds(originalPreview, originalScroller);
  const optimizedBounds = distributionElementBounds(optimizedPreview, optimizedScroller);
  const points = [{
    original: originalBounds.top,
    optimized: optimizedBounds.top,
  }];
  pairs.forEach(([originalElement, optimizedElement]) => {
    addDistributionMetricPairs(
      points,
      distributionElementMetrics(originalElement, originalScroller),
      distributionElementMetrics(optimizedElement, optimizedScroller),
    );
  });
  points.push({
    original: originalBounds.bottom,
    optimized: optimizedBounds.bottom,
  });

  points.sort((a, b) => a.original - b.original || a.optimized - b.optimized);
  let lastOptimized = -Infinity;
  distributionScrollAnchors = points.filter(point => {
    if (point.optimized + 1 < lastOptimized) return false;
    lastOptimized = Math.max(lastOptimized, point.optimized);
    return true;
  });
}

function scheduleDistributionScrollAnchors() {
  if (distributionAnchorFrame) cancelAnimationFrame(distributionAnchorFrame);
  distributionAnchorFrame = requestAnimationFrame(() => {
    rebuildDistributionScrollAnchors();
    $$("#distributionOriginalPreview img, #distributionOptimizedPreview img").forEach(image => {
      if (!image.complete) image.addEventListener("load", scheduleDistributionScrollAnchors, { once: true });
    });
  });
}

function mapDistributionAnchorPosition(position, from, to) {
  const points = distributionScrollAnchors
    .map(point => ({ from: point[from], to: point[to] }))
    .sort((a, b) => a.from - b.from);
  if (!points.length) return null;
  if (position <= points[0].from) return points[0].to + position - points[0].from;
  for (let index = 1; index < points.length; index += 1) {
    const before = points[index - 1];
    const after = points[index];
    if (position > after.from) continue;
    if (after.from === before.from) return after.to;
    const localOffset = (position - before.from) / (after.from - before.from);
    return before.to + localOffset * (after.to - before.to);
  }
  const last = points.at(-1);
  return last.to + position - last.from;
}

function syncDistributionScroll(source, target, from, to) {
  if (source === distributionSyncedElement && performance.now() < distributionSyncedUntil) return;
  if (distributionScrollFrame) cancelAnimationFrame(distributionScrollFrame);
  distributionScrollFrame = requestAnimationFrame(() => {
    distributionScrollFrame = 0;
    if (!distributionScrollAnchors.length) rebuildDistributionScrollAnchors();
    const focusRatio = 0.35;
    const sourceFocus = source.scrollTop + source.clientHeight * focusRatio;
    const targetFocus = mapDistributionAnchorPosition(sourceFocus, from, to);
    if (targetFocus == null) return;
    const maximum = Math.max(0, target.scrollHeight - target.clientHeight);
    const nextScrollTop = Math.max(0, Math.min(maximum, targetFocus - target.clientHeight * focusRatio));
    distributionSyncedElement = target;
    distributionSyncedUntil = performance.now() + 120;
    target.scrollTop = nextScrollTop;
  });
}

function bindDistributionScrollSync() {
  const original = $(".distribution-original");
  const optimized = $(".distribution-optimized");
  original.addEventListener("scroll", () => {
    syncDistributionScroll(original, optimized, "original", "optimized");
  }, { passive: true });
  optimized.addEventListener("scroll", () => {
    syncDistributionScroll(optimized, original, "optimized", "original");
  }, { passive: true });
  window.addEventListener("resize", scheduleDistributionScrollAnchors);
}

function distributionTaskById(id) {
  return state.distribution.tasks.find(task => task.id === id) || null;
}

async function loadDistributionTasks({ keepSelection = true } = {}) {
  state.distribution.loading = true;
  try {
    const data = await api("/api/distribution/tasks");
    state.distribution.tasks = data.tasks || [];
    state.distribution.counts = data.counts || { pending: 0, synced: 0, skipped: 0 };
    state.distribution.loaded = true;
    $("#distributionTaskCount").textContent = `(${state.distribution.tasks.length} 篇)`;
    $("#distributionPendingCount").textContent = state.distribution.counts.pending || 0;
    $("#distributionSyncedCount").textContent = state.distribution.counts.synced || 0;
    $("#distributionSkippedCount").textContent = state.distribution.counts.skipped || 0;
    renderDistributionTasks();

    const visible = filteredDistributionTasks();
    const selectedIsVisible = keepSelection && visible.some(task => task.id === state.distribution.selectedId);
    if (!selectedIsVisible && visible.length) {
      await selectDistributionTask(visible[0].id);
    } else if (selectedIsVisible) {
      renderDistributionTasks();
    }
  } finally {
    state.distribution.loading = false;
  }
}

function filteredDistributionTasks() {
  const query = ($("#distributionSearch")?.value || "").trim().toLowerCase();
  return state.distribution.tasks.filter(task => {
    if (task.status !== state.distribution.filter) return false;
    return !query || task.title.toLowerCase().includes(query);
  });
}

function renderDistributionTasks() {
  const list = $("#distributionTaskList");
  if (!list) return;
  const tasks = filteredDistributionTasks();
  if (!tasks.length) {
    list.innerHTML = '<div class="distribution-empty">当前状态下没有匹配的文章。</div>';
    return;
  }
  list.innerHTML = tasks.map(task => `
    <button type="button" class="distribution-task ${task.id === state.distribution.selectedId ? "active" : ""}" data-distribution-id="${escapeAttr(task.id)}">
      <span class="distribution-task-title">${escapeHtml(task.title)}</span>
      <span class="distribution-task-meta">
        <span>${task.versionCount ? `已有 ${task.versionCount} 个版本` : "未生成优化版"}</span>
        <span>${escapeHtml(task.date || "")}</span>
      </span>
    </button>
  `).join("");
}

async function selectDistributionTask(id) {
  if (!id) return;
  state.distribution.selectedId = id;
  renderDistributionTasks();
  $("#distributionOptimizeStatus").textContent = "";
  $(".distribution-original").scrollTop = 0;
  $(".distribution-optimized").scrollTop = 0;
  $("#distributionOriginalPreview").innerHTML = '<div class="distribution-empty">正在读取文章...</div>';
  $("#distributionOptimizedPreview").innerHTML = '<div class="distribution-empty">正在读取优化版本...</div>';
  const detail = await api(`/api/distribution/article?id=${encodeURIComponent(id)}`);
  if (state.distribution.selectedId !== id) return;
  state.distribution.detail = detail;
  state.distribution.selectedVersion = Number(detail.selectedVersion || detail.versions?.at(-1)?.number || 0);
  renderDistributionDetail();
}

function selectedDistributionVersion() {
  const detail = state.distribution.detail;
  if (!detail) return null;
  return detail.versions.find(version => Number(version.number) === Number(state.distribution.selectedVersion)) || null;
}

function renderDistributionDetail() {
  const detail = state.distribution.detail;
  const hasDetail = Boolean(detail);
  $("#optimizeDistribution").disabled = !hasDetail;
  $("#distributionStatus").disabled = !hasDetail;
  if (!detail) return;

  const officialDate = String(detail.date || "").replace(/\D/g, "").slice(0, 8);
  $("#distributionOriginalMeta").textContent = `官网发布日期：${officialDate || "未知"}`;
  $("#distributionOriginalPreview").innerHTML = detail.originalHtml || '<div class="distribution-empty">没有可预览的正文。</div>';
  $("#distributionStatus").value = detail.status;
  $("#distributionCover").innerHTML = detail.coverUrl
    ? `<img src="${escapeAttr(detail.coverUrl)}" alt="${escapeAttr(detail.title)}封面">`
    : "<span>暂无封面图</span>";
  $("#distributionFacts").innerHTML = `
    <span class="distribution-fact">${detail.imageCount || 0} 张图</span>
    <span class="distribution-fact">${detail.purchaseButtons?.length || 0} 个购买按钮</span>
    <span class="distribution-fact">${detail.versions?.length || 0} 个优化版本</span>
  `;
  renderDistributionVersions();
  scheduleDistributionScrollAnchors();
}

function renderDistributionVersions() {
  const detail = state.distribution.detail;
  const versions = detail?.versions || [];
  const tabs = $("#distributionVersionTabs");
  const preview = $("#distributionOptimizedPreview");
  tabs.innerHTML = Array.from({ length: MAX_DISTRIBUTION_VERSIONS }, (_, index) => {
    const number = index + 1;
    const version = versions.find(item => Number(item.number) === number);
    const selected = version && number === Number(state.distribution.selectedVersion);
    return `<button type="button" class="${selected ? "active" : ""}" ${version ? `data-distribution-version="${number}"` : "disabled"}>版本 ${number}</button>`;
  }).join("");
  if (!versions.length) {
    preview.innerHTML = '<div class="distribution-empty">尚未生成优化版本。点击原文区域的「AI 优化」开始。</div>';
    $("#distributionSummary").textContent = "生成优化版本后显示摘要。";
    $("#distributionSummaryCount").textContent = "0 / 30 字";
    $("#exportDistribution").disabled = true;
    scheduleDistributionScrollAnchors();
    return;
  }
  if (!versions.some(version => Number(version.number) === Number(state.distribution.selectedVersion))) {
    state.distribution.selectedVersion = Number(versions.at(-1).number);
  }
  tabs.querySelector(`[data-distribution-version="${state.distribution.selectedVersion}"]`)?.classList.add("active");
  const version = selectedDistributionVersion();
  preview.innerHTML = version?.html || '<div class="distribution-empty">该版本没有正文。</div>';
  const summary = version?.summary || detail.summary || "";
  $("#distributionSummary").textContent = summary || "该版本没有生成摘要。";
  $("#distributionSummaryCount").textContent = `${Array.from(summary).length} / 30 字`;
  $("#exportDistribution").disabled = !version;
  $("#distributionExportDescription").textContent = `${detail.title} · 优化版本 ${state.distribution.selectedVersion}`;
  scheduleDistributionScrollAnchors();
}

async function chooseDistributionVersion(number) {
  const detail = state.distribution.detail;
  if (!detail) return;
  number = Number(number);
  state.distribution.selectedVersion = number;
  renderDistributionVersions();
  try {
    await api("/api/distribution/select-version", { id: detail.id, version: number });
    detail.selectedVersion = number;
    const task = distributionTaskById(detail.id);
    if (task) task.selectedVersion = number;
  } catch (err) {
    $("#distributionOptimizeStatus").textContent = err.message;
  }
}

function openDistributionVersionLimitDialog() {
  const detail = state.distribution.detail;
  if (!detail) return;
  $("#distributionDeleteVersionOptions").innerHTML = detail.versions
    .slice()
    .sort((a, b) => Number(a.number) - Number(b.number))
    .map(version => `
      <label>
        <input type="checkbox" value="${version.number}">
        <span>版本 ${version.number}</span>
      </label>
    `).join("");
  $("#confirmDistributionVersionDelete").disabled = true;
  const dialog = $("#distributionVersionLimitDialog");
  if (typeof dialog.showModal === "function") dialog.showModal();
  else dialog.setAttribute("open", "");
}

async function deleteDistributionVersionsAndRegenerate() {
  const detail = state.distribution.detail;
  if (!detail) return;
  const versions = $$("#distributionDeleteVersionOptions input:checked").map(input => Number(input.value));
  if (!versions.length) return;
  const button = $("#confirmDistributionVersionDelete");
  button.disabled = true;
  button.textContent = "正在删除...";
  try {
    await api("/api/distribution/delete-versions", { id: detail.id, versions });
    $("#distributionVersionLimitDialog").close?.();
    await selectDistributionTask(detail.id);
    await optimizeDistributionArticle({ skipVersionLimit: true });
  } finally {
    button.textContent = "删除并重新生成";
  }
}

async function optimizeDistributionArticle({ skipVersionLimit = false } = {}) {
  const detail = state.distribution.detail;
  if (!detail) throw new Error("请先选择一篇文章");
  if (!skipVersionLimit && detail.versions.length >= MAX_DISTRIBUTION_VERSIONS) {
    openDistributionVersionLimitDialog();
    return;
  }
  const optimizeButton = $("#optimizeDistribution");
  optimizeButton.disabled = true;
  optimizeButton.textContent = "AI 优化中...";
  $("#distributionOptimizeStatus").textContent = "正在进行局部规范调整并生成 30 字内摘要，请稍候...";
  try {
    const result = await api("/api/distribution/optimize", { id: detail.id });
    $("#distributionOptimizeStatus").textContent = result.warnings?.length
      ? `已生成版本 ${result.version}。AI 草稿改动过大，已自动改用保守规则版本：${result.warnings.join("；")}`
      : `已生成版本 ${result.version}，原文结构与图片顺序校验通过。`;
    await selectDistributionTask(detail.id);
    await loadDistributionTasks({ keepSelection: true });
  } finally {
    optimizeButton.textContent = "AI 优化";
    optimizeButton.disabled = false;
  }
}

async function updateDistributionStatus() {
  const detail = state.distribution.detail;
  if (!detail) return;
  const status = $("#distributionStatus").value;
  $("#distributionStatus").disabled = true;
  $("#distributionInfoStatus").textContent = "正在保存状态...";
  try {
    await api("/api/distribution/status", { id: detail.id, status });
    detail.status = status;
    const task = distributionTaskById(detail.id);
    if (task) task.status = status;
    $("#distributionInfoStatus").textContent = `已手动标记为「${distributionStatusLabels[status]}」。`;
    await loadDistributionTasks({ keepSelection: true });
  } finally {
    $("#distributionStatus").disabled = false;
  }
}

function openDistributionExportDialog() {
  if (!selectedDistributionVersion()) return;
  const dialog = $("#distributionExportDialog");
  if (typeof dialog.showModal === "function") dialog.showModal();
  else dialog.setAttribute("open", "");
}

async function exportDistributionVersion(type) {
  const detail = state.distribution.detail;
  const version = selectedDistributionVersion();
  if (!detail || !version) throw new Error("请先选择一个优化版本");
  const dialog = $("#distributionExportDialog");
  dialog.close?.();
  $("#distributionOptimizeStatus").textContent = type === "docx" ? "正在生成带图片的 Word 文档..." : "正在导出 Markdown...";
  const blob = await fetchBlob("/api/distribution/export", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id: detail.id, version: version.number, type }),
  });
  const safeTitle = detail.title.replace(/[<>:"/\\|?*\x00-\x1f]/g, "-").slice(0, 120);
  const extension = type === "docx" ? "docx" : "md";
  downloadBlob(blob, `${safeTitle}-分发版-v${version.number}.${extension}`);
  $("#distributionOptimizeStatus").textContent = type === "docx"
    ? `已导出版本 ${version.number}：Word 正文包含对应图片，不包含封面和摘要。`
    : `已导出版本 ${version.number}：Markdown 保留【图 X】占位符，并已写入该文章发布包的「CSDN 发布版.md」。`;
}

function activeImageModuleId() {
  return ["bg", "annotation", "imageEditor"].find(id => $(`#${id}`)?.classList.contains("active")) || null;
}

function imageModuleToolVisuals(moduleId = activeImageModuleId()) {
  const toolbar = moduleId === "bg"
    ? $(".bg-mode-toolbar")
    : moduleId === "annotation"
      ? $(".annotation-actions")
      : moduleId === "imageEditor"
        ? $(".image-editor-actions")
        : null;
  if (!toolbar) return [];
  return Array.from(toolbar.children)
    .map(element => {
      if (element.matches("button")) return element;
      if (element.matches("label")) return element.querySelector(":scope > span");
      if (element.matches(".image-editor-more")) return element.querySelector(":scope > button");
      return null;
    })
    .filter(element => element && !element.hidden && getComputedStyle(element).display !== "none");
}

function showImageModuleShortcutHints(show) {
  $$(".tool-shortcut-hint").forEach(element => {
    element.classList.remove("tool-shortcut-hint");
    delete element.dataset.shortcutNumber;
  });
  if (!show) return;
  imageModuleToolVisuals().slice(0, 10).forEach((element, index) => {
    element.classList.add("tool-shortcut-hint");
    element.dataset.shortcutNumber = String(index + 1);
  });
}

function runActiveImageModuleHistory(redo) {
  const moduleId = activeImageModuleId();
  if (moduleId === "bg") restoreBgHistory(bgHistoryIndex + (redo ? 1 : -1));
  else if (moduleId === "annotation") {
    restoreAnnotationHistory(annotationState.historyIndex + (redo ? 1 : -1));
  } else if (moduleId === "imageEditor") {
    runImageEditorHistory(redo);
  }
}

function enterActiveImageModuleView() {
  const moduleId = activeImageModuleId();
  if (moduleId === "annotation" && annotationState.image) {
    setAnnotationMode("view");
  } else if (moduleId === "imageEditor" && imageEditorState.hasImage) {
    setImageEditorMode("view");
  } else if (moduleId === "bg") {
    annotationState = bgAnnotationState;
    blueBgState.interaction = null;
    blueBgState.snapGuides = emptySnapGuides();
    openBgBackgroundDialog();
  }
}

const IMAGE_ZOOM_STEPS = [
  0.25, 0.33, 0.5, 0.67, 0.75, 1, 1.25, 1.5, 2, 3, 4, 6, 8, 12, 16, 20,
];

function steppedImageZoom(current, direction, minimum = 0.5) {
  const steps = IMAGE_ZOOM_STEPS.filter(value => value >= minimum);
  if (direction > 0) {
    return steps.find(value => value > current + 0.001) ?? steps.at(-1);
  }
  return [...steps].reverse().find(value => value < current - 0.001) ?? steps[0];
}

function stepActiveImageModuleZoom(direction) {
  const moduleId = activeImageModuleId();
  let stage;
  let nextZoom;
  let apply;
  if (moduleId === "bg" && blueBgState.canvasWidth) {
    stage = $("#blueBgStage");
    nextZoom = steppedImageZoom(blueBgState.zoom, direction);
    apply = setBlueBgZoomAtPoint;
  } else if (moduleId === "annotation" && annotationState.image) {
    stage = $("#annotationStage");
    nextZoom = steppedImageZoom(annotationState.zoom, direction);
    apply = setAnnotationZoomAtPoint;
  } else if (moduleId === "imageEditor" && imageEditorState.hasImage) {
    stage = $("#imageEditorStage");
    nextZoom = steppedImageZoom(imageEditorState.zoom, direction);
    apply = setImageEditorZoomAtPoint;
  } else {
    return false;
  }
  const rect = stage.getBoundingClientRect();
  apply(nextZoom, rect.left + rect.width / 2, rect.top + rect.height / 2);
  stage.focus();
  return true;
}

function selectAllInActiveImageTool() {
  const moduleId = activeImageModuleId();
  if (
    moduleId === "bg" &&
    $("#bgBlueMode").checked &&
    (blueBgState.layers.length || bgAnnotationState.items.length)
  ) {
    blueBgState.selectedIds = blueBgState.layers.map(layer => layer.id);
    blueBgState.selectedId = blueBgState.selectedIds.at(-1) ?? null;
    blueBgState.toolMode = "move";
    blueBgState.interaction = null;
    blueBgState.snapGuides = emptySnapGuides();
    bgAnnotationState.selectedIds = bgAnnotationState.items.map(item => item.id);
    bgAnnotationState.selectedId = bgAnnotationState.selectedIds.at(-1) ?? null;
    bgAnnotationState.selectedPart = null;
    bgAnnotationState.mode = "view";
    bgAnnotationState.interaction = null;
    bgAnnotationState.snapGuides = emptySnapGuides();
    setBgInspectorMode("effects");
    updateBlueBgControls();
    renderBlueBgCanvas();
    requestAnimationFrame(renderBlueBgCanvas);
    $("#blueBgStage").focus();
    blueBgStatus(`已全选 ${blueBgState.selectedIds.length} 张前景图和 ${bgAnnotationState.selectedIds.length} 个标注。`);
    return true;
  }
  if (moduleId === "bg" && !$("#bgBlueMode").checked && bgMaterials.length) {
    bgSelectedMaterialIndices = bgMaterials.map((_, index) => index);
    bgSelectedMaterialIndex = bgSelectedMaterialIndices[0];
    renderBgMaterialList();
    renderBgPreviewList();
    syncBgEffectToolbar();
    updateBgExportState();
    $("#bgPreview").focus?.();
    return true;
  }
  if (moduleId === "annotation" && annotationState.image && annotationState.items.length) {
    annotationState.selectedIds = annotationState.items.map(item => item.id);
    annotationState.selectedId = annotationState.selectedIds.at(-1) ?? null;
    annotationState.selectedPart = null;
    annotationState.mode = "view";
    annotationState.interaction = null;
    annotationState.snapGuides = emptySnapGuides();
    updateAnnotationControls();
    renderAnnotationCanvas();
    $("#annotationStage").focus();
    annotationStatusText(`已全选 ${annotationState.selectedIds.length} 个标注。`);
    return true;
  }
  if (
    moduleId === "imageEditor" &&
    imageEditorState.hasImage &&
    ["remove", "crop"].includes(imageEditorState.mode)
  ) {
    imageEditorState.selection = {
      x: 0,
      y: 0,
      width: imageEditorState.documentCanvas.width,
      height: imageEditorState.documentCanvas.height,
    };
    imageEditorState.interaction = null;
    imageEditorState.snapGuides = emptySnapGuides();
    renderImageEditorCanvas();
    updateImageEditorControls();
    imageEditorStatus("已全选图像区域。");
    return true;
  }
  if (
    moduleId === "annotation" &&
    annotationState.image &&
    ["mask", "blur"].includes(annotationState.mode)
  ) {
    const canvas = annotationCanvas();
    const item = {
      id: annotationState.nextId++,
      type: annotationState.mode,
      x: 0,
      y: 0,
      width: canvas.width,
      height: canvas.height,
      ...(annotationState.mode === "blur" ? { strength: 6 } : {}),
    };
    annotationState.items.push(item);
    annotationState.selectedId = item.id;
    annotationState.selectedIds = [];
    annotationState.selectedPart = null;
    finishAnnotationChange(
      annotationState.mode === "blur" ? "已全选图像并创建高斯模糊" : "已全选图像并创建遮挡块"
    );
    return true;
  }
  return false;
}

function exportActiveImageModule() {
  const moduleId = activeImageModuleId();
  const button = moduleId === "bg"
    ? $("#bgExportButton")
    : moduleId === "annotation"
      ? $("#exportAnnotation")
      : moduleId === "imageEditor"
        ? $("#imageEditorExport")
        : null;
  if (!button || button.disabled) return false;
  button.click();
  return true;
}

function imageModuleGlobalKeyDown(event) {
  const moduleId = activeImageModuleId();
  if (!moduleId) return;
  const target = event.target;
  const editing = target?.matches?.(
    'textarea, select, [contenteditable="true"], input:not([type="file"]):not([type="button"]):not([type="checkbox"])'
  );
  const commandKey = event.metaKey || event.ctrlKey;
  const zoomIn = commandKey && (
    event.code === "Equal" || event.code === "NumpadAdd" || event.key === "+"
  );
  const zoomOut = commandKey && (
    event.code === "Minus" || event.code === "NumpadSubtract" || event.key === "-"
  );
  if (zoomIn || zoomOut) {
    if (stepActiveImageModuleZoom(zoomIn ? 1 : -1)) event.preventDefault();
    return;
  }
  if (commandKey && event.key.toLowerCase() === "e") {
    event.preventDefault();
    exportActiveImageModule();
    return;
  }
  if (commandKey && event.key.toLowerCase() === "d") {
    event.preventDefault();
    deselectActiveImageModule(moduleId);
    return;
  }
  if (commandKey && event.key.toLowerCase() === "s" && moduleId === "imageEditor") {
    event.preventDefault();
    syncImageEditorToBgMaterial().catch(error => imageEditorStatus(error.message));
    return;
  }
  if (moduleId === "bg" && event.key === "Escape" && blueBgState.inspectorMode !== "background") {
    event.preventDefault();
    clearAllBgCanvasSelections();
    openBgBackgroundDialog();
    $("#blueBgStage").focus();
    blueBgStatus("已切换至背景美化。");
    return;
  }
  if (editing) return;
  if (commandKey && event.key.toLowerCase() === "a" && selectAllInActiveImageTool()) {
    event.preventDefault();
    return;
  }
  if (event.defaultPrevented) return;
  const plainKey = !event.metaKey && !event.ctrlKey && !event.altKey
    ? event.key.toLowerCase()
    : "";
  if (plainKey === "i") {
    const input = moduleId === "bg"
      ? $("#bgFiles")
      : moduleId === "annotation"
        ? $("#annotationFile")
        : moduleId === "imageEditor"
          ? $("#imageEditorFile")
          : null;
    if (input) {
      event.preventDefault();
      input.click();
      return;
    }
  }
  if (moduleId === "bg") {
    const bgShortcuts = {
      b: selectNextBlueBgLayer,
      n: () => activateBgAnnotationMode("number"),
      m: () => activateBgAnnotationMode("mask"),
      p: () => activateBgAnnotationMode("pen"),
      f: () => activateBgAnnotationMode("blur"),
      g: () => activateBgAnnotationMode("magnifier"),
    };
    const action = bgShortcuts[plainKey];
    if (action) {
      event.preventDefault();
      action();
      return;
    }
  }
  if (moduleId === "imageEditor" && imageEditorState.hasImage) {
    const imageEditorShortcuts = {
      r: () => setImageEditorMode("remove"),
      e: () => setImageEditorMode("inpaint"),
      c: () => setImageEditorMode("crop"),
      g: () => setImageEditorMode("gradient"),
      s: () => setImageEditorMode("split"),
      b: () => setImageEditorMode("blend"),
      w: suggestImageEditorWindow,
      h: () => setImageEditorMode(imageEditorState.mode === "screen" ? "view" : "screen"),
    };
    const action = imageEditorShortcuts[plainKey];
    if (action) {
      event.preventDefault();
      action();
      return;
    }
  }
  if (moduleId === "annotation" && !event.metaKey && !event.ctrlKey && !event.altKey) {
    const annotationShortcuts = {
      n: () => setAnnotationMode("number"),
      m: () => setAnnotationMode("mask"),
      f: () => setAnnotationMode("blur"),
      g: () => setAnnotationMode("magnifier"),
    };
    const action = annotationShortcuts[event.key.toLowerCase()];
    if (action) {
      event.preventDefault();
      action();
      return;
    }
  }
  if (commandKey && (event.key.toLowerCase() === "z" || (!event.metaKey && event.key.toLowerCase() === "y"))) {
    event.preventDefault();
    runActiveImageModuleHistory(event.shiftKey || event.key.toLowerCase() === "y");
    return;
  }
  if (event.altKey) {
    showImageModuleShortcutHints(true);
    const digitMatch = /^(?:Digit|Numpad)([0-9])$/.exec(event.code);
    if (digitMatch) {
      event.preventDefault();
      const digit = Number(digitMatch[1]);
      const index = digit === 0 ? 9 : digit - 1;
      imageModuleToolVisuals(moduleId)[index]?.click();
      return;
    }
  }
  if (!event.metaKey && !event.ctrlKey && !event.altKey && event.key.toLowerCase() === "v") {
    event.preventDefault();
    if (moduleId === "bg") {
      clearAllBgCanvasSelections();
      openBgBackgroundDialog();
      $("#blueBgStage")?.focus();
      blueBgStatus("已切换至背景美化。");
    } else {
      enterActiveImageModuleView();
    }
  }
}

function deselectActiveImageModule(moduleId = activeImageModuleId()) {
  if (moduleId === "bg") {
    const hasSelection = blueBgState.selectedId !== null || blueBgState.selectedIds.length ||
      bgAnnotationState.selectedId !== null || bgAnnotationState.selectedIds.length || bgAnnotationState.selectedPart;
    if (!hasSelection) return false;
    clearAllBgCanvasSelections();
    openBgBackgroundDialog();
    blueBgStatus("已取消框选。");
    return true;
  }
  if (moduleId === "annotation") {
    if (!annotationState.selectedId && !annotationState.selectedIds.length && !annotationState.selectedPart) return false;
    annotationState.selectedId = null;
    annotationState.selectedIds = [];
    annotationState.selectedPart = null;
    annotationState.interaction = null;
    annotationState.snapGuides = emptySnapGuides();
    annotationState.editingNumberId = null;
    updateAnnotationControls();
    renderAnnotationCanvas();
    annotationStatusText("已取消框选。");
    return true;
  }
  if (moduleId === "imageEditor") {
    if (imageEditorState.selection) {
      cancelImageEditorSelection();
      return true;
    }
    if (imageEditorState.gradient) {
      cancelImageEditorGradient();
      return true;
    }
  }
  return false;
}

function bind() {
  $$(".tabs button").forEach(btn => btn.onclick = () => showTab(btn.dataset.tab));
  $("#reloadDistributionTasks").onclick = () => loadDistributionTasks({ keepSelection: true }).catch(err => {
    $("#distributionTaskList").innerHTML = `<div class="distribution-empty">${escapeHtml(err.message)}</div>`;
  });
  $("#distributionSearch").oninput = renderDistributionTasks;
  $$(".distribution-filters button").forEach(button => {
    button.onclick = () => {
      state.distribution.filter = button.dataset.distributionFilter;
      $$(".distribution-filters button").forEach(item => item.classList.toggle("active", item === button));
      renderDistributionTasks();
      const visible = filteredDistributionTasks();
      if (visible.length && !visible.some(task => task.id === state.distribution.selectedId)) {
        selectDistributionTask(visible[0].id).catch(err => $("#distributionInfoStatus").textContent = err.message);
      }
    };
  });
  $("#distributionTaskList").onclick = event => {
    const task = event.target.closest("[data-distribution-id]");
    if (task) selectDistributionTask(task.dataset.distributionId).catch(err => $("#distributionInfoStatus").textContent = err.message);
  };
  $("#distributionVersionTabs").onclick = event => {
    const version = event.target.closest("[data-distribution-version]");
    if (version) chooseDistributionVersion(version.dataset.distributionVersion);
  };
  $("#distributionDeleteVersionOptions").onchange = () => {
    $("#confirmDistributionVersionDelete").disabled = !$("#distributionDeleteVersionOptions input:checked");
  };
  $("#confirmDistributionVersionDelete").onclick = () => deleteDistributionVersionsAndRegenerate().catch(err => {
    $("#distributionOptimizeStatus").textContent = err.message;
    $("#distributionVersionLimitDialog").close?.();
  });
  $("#optimizeDistribution").onclick = () => optimizeDistributionArticle().catch(err => {
    $("#distributionOptimizeStatus").textContent = err.message;
  });
  $("#exportDistribution").onclick = openDistributionExportDialog;
  $("#distributionStatus").onchange = () => updateDistributionStatus().catch(err => {
    $("#distributionInfoStatus").textContent = err.message;
  });
  $$("#distributionExportDialog [data-export-type]").forEach(button => {
    button.onclick = () => exportDistributionVersion(button.dataset.exportType).catch(err => {
      $("#distributionOptimizeStatus").textContent = err.message;
    });
  });
  $("#reloadTasks").onclick = () => toggleTaskSource().catch(err => alert(err.message));
  $("#taskSearch").oninput = renderTasks;
  $("#addManualTask").onclick = () => addManualTask().catch(err => $("#packageResult").textContent = err.message);
  $("#manualUrl").onkeydown = event => {
    if (event.key === "Enter") addManualTask().catch(err => $("#packageResult").textContent = err.message);
  };
  $("#downloadDir").onchange = () => localStorage.setItem(DOWNLOAD_DIR_KEY, $("#downloadDir").value.trim());
  $("#buildPackage").onclick = () => {
    prepareCompletionSound();
    buildPackage();
  };
  $("#callAi").onclick = () => callAi().catch(err => $("#packageResult").textContent = err.message);
  $("#genLinks").onclick = () => {
    try {
      genLinks();
    } catch (err) {
      $("#linksResult").classList.remove("links-result-table");
      $("#linksResult").textContent = err.message;
    }
  };
  $("#processMdLinks").onclick = processMdLinks;
  $("#linksResult").onclick = event => {
    const button = event.target.closest(".link-copy");
    if (button) copyLinkFromButton(button);
  };
  $("#makeShort").onclick = () => makeShort("shorturl").catch(err => $("#shortResult").textContent = err.message);
  $("#expandShort").onclick = () => makeShort("expand").catch(err => $("#shortResult").textContent = err.message);
  $("#bgImportButton").onclick = () => {
    $("#bgFiles").click();
  };
  $("#bgAddTabButton").onclick = () => createBgTab();
  setupCanvasTabBar({
    wrap: $("#bgCanvasTabs"),
    dataKey: "bgTabId",
    onSelect: (tabId, options) => switchBgTab(tabId, options),
    onClose: tabId => closeBgTab(tabId),
    onMove: (from, to) => moveBgTab(from, to),
  });
  $("#imageEditorAddTabButton").onclick = () => createImageEditorTab();
  setupCanvasTabBar({
    wrap: $("#imageEditorTabs"),
    dataKey: "imageEditorTabId",
    onSelect: (tabId, options) => switchImageEditorTab(tabId, options),
    onClose: tabId => closeImageEditorTab(tabId),
    onMove: (from, to) => moveImageEditorTab(from, to),
  });
  $("#canvasTabClose").onclick = closeCanvasTabFromMenu;
  $("#bgViewMode").onclick = openBgBackgroundDialog;
  $("#bgBackgroundButton").onclick = openBgImageStylePanel;
  $("#bgBackgroundFile").onchange = () => {
    if (!$("#bgBackgroundFile").files?.length) return;
    $("#bgBackgroundType").value = "image";
    applyBgBackgroundFromTiles();
  };
  $("#bgCustomWallpaperFile").onchange = event => {
    addCustomBgWallpaper(event.target.files?.[0]).catch(err => blueBgStatus(err.message));
    event.target.value = "";
  };
  $("#bgBackgroundColor").onchange = () => {
    $("#bgBackgroundType").value = "solid";
    localStorage.setItem(BG_CUSTOM_COLOR_KEY, $("#bgBackgroundColor").value);
    applyBgBackgroundFromTiles();
  };
  $("#bgBackgroundDialog").onclick = event => {
    const addCustom = event.target.closest("[data-bg-add-custom]");
    if (addCustom) {
      if (addCustom.dataset.bgAddCustom === "wallpaper") $("#bgCustomWallpaperFile").click();
      else if (addCustom.dataset.bgAddCustom === "gradient") addCustomBgGradient();
      else if (addCustom.dataset.bgAddCustom === "aspect") addCustomBgAspect();
      return;
    }
    const customTile = event.target.closest('[data-bg-custom="true"]');
    if (customTile) {
      $("#bgBackgroundFile").click();
      return;
    }
    const backgroundTile = event.target.closest("[data-bg-type]");
    if (backgroundTile) {
      $("#bgBackgroundType").value = backgroundTile.dataset.bgType;
      if (backgroundTile.dataset.bgGradient) $("#bgBackgroundGradient").value = backgroundTile.dataset.bgGradient;
      if (backgroundTile.dataset.bgWallpaper) $("#bgWallpaperSelect").value = backgroundTile.dataset.bgWallpaper;
      applyBgBackgroundFromTiles();
      return;
    }
    const aspectTile = event.target.closest("[data-bg-aspect]");
    if (aspectTile) {
      $("#bgCanvasAspect").value = aspectTile.dataset.bgAspect;
      applyBgBackgroundFromTiles();
    }
  };
  $("#bgBackgroundDialog").oncontextmenu = event => {
    const tile = event.target.closest("[data-bg-type], [data-bg-aspect]");
    if (!tile) return;
    const isCustom = tile.dataset.bgCustomGradient || tile.dataset.bgCustomAspect || tile.dataset.bgCustom;
    event.preventDefault();
    showBgChoiceContextMenu(tile, event.clientX, event.clientY);
  };
  $("#bgChoiceRemove").onclick = () => removeCustomBgChoice().catch(err => blueBgStatus(err.message));
  $("#bgUndo").onclick = () => {
    closeBgBackgroundPanel();
    restoreBgHistory(bgHistoryIndex - 1);
  };
  $("#bgRedo").onclick = () => {
    closeBgBackgroundPanel();
    restoreBgHistory(bgHistoryIndex + 1);
  };
  $("#bgExportButton").onclick = () => {
    closeBgBackgroundPanel();
    confirmBlueBgRender();
  };
  $("#bgFiles").onchange = event => {
    importBgFiles(event.target.files).catch(err => alert(err.message));
    event.target.value = "";
  };
  $("#bgMaterialList").onclick = event => {
    if (suppressBgMaterialClick) {
      suppressBgMaterialClick = false;
      event.preventDefault();
      return;
    }
    const material = event.target.closest("[data-bg-material-index]");
    if (material) {
      const index = Number(material.dataset.bgMaterialIndex);
      selectUnifiedBgMaterial(index, event.metaKey || event.ctrlKey).catch(err => blueBgStatus(err.message));
    } else if (event.target.closest("[data-import-bg-material]")) {
      $("#bgFiles").click();
    }
  };
  $("#bgMaterialList").oncontextmenu = event => {
    const card = event.target.closest("[data-bg-material-index]");
    if (!card) return;
    event.preventDefault();
    const materialIndex = Number(card.dataset.bgMaterialIndex);
    const layer = blueBgState.layers.find(candidate => candidate.materialIndex === materialIndex);
    if (layer) showBlueBgContextMenuForLayer(layer, event.clientX, event.clientY);
    else showBlueBgContextMenuForMaterial(materialIndex, event.clientX, event.clientY);
  };
  $("#bgMaterialList").onpointerdown = event => {
    if (event.button !== 0) return;
    const card = event.target.closest("[data-bg-material-index]");
    if (!card) return;
    const rect = card.getBoundingClientRect();
    bgMaterialPointerDrag = {
      pointerId: event.pointerId,
      sourceIndex: Number(card.dataset.bgMaterialIndex),
      sourceCard: card,
      startX: event.clientX,
      startY: event.clientY,
      offsetX: event.clientX - rect.left,
      offsetY: event.clientY - rect.top,
      width: rect.width,
      height: rect.height,
      moved: false,
      targetIndex: Number(card.dataset.bgMaterialIndex),
      placement: "before",
      placeholder: null,
    };
  };

  const positionBgMaterialDrag = event => {
    const drag = bgMaterialPointerDrag;
    if (!drag || drag.pointerId !== event.pointerId) return;
    if (!drag.moved && Math.hypot(event.clientX - drag.startX, event.clientY - drag.startY) < 6) return;
    if (!drag.moved) {
      drag.moved = true;
      const placeholder = document.createElement("div");
      placeholder.className = "bg-material-drop-slot";
      placeholder.setAttribute("aria-hidden", "true");
      drag.placeholder = placeholder;
      drag.sourceCard.remove();
      document.body.appendChild(drag.sourceCard);
      drag.sourceCard.classList.add("is-dragging");
      drag.sourceCard.style.width = `${drag.width}px`;
      drag.sourceCard.style.height = `${drag.height}px`;
      document.body.classList.add("is-dragging-bg-material");
    }
    drag.sourceCard.style.left = `${event.clientX - drag.offsetX}px`;
    drag.sourceCard.style.top = `${event.clientY - drag.offsetY}px`;

    const list = $("#bgMaterialList");
    const cards = $$(".bg-material-card[data-bg-material-index]", list);
    const importCard = $(".bg-material-import-card", list);
    if (!cards.length) {
      list.insertBefore(drag.placeholder, importCard || null);
      drag.targetIndex = drag.sourceIndex;
      drag.placement = "before";
      return;
    }
    const beforeCard = cards.find(card => {
      const rect = card.getBoundingClientRect();
      return event.clientY < rect.top + rect.height / 2;
    });
    if (beforeCard) {
      list.insertBefore(drag.placeholder, beforeCard);
      drag.targetIndex = Number(beforeCard.dataset.bgMaterialIndex);
      drag.placement = "before";
      return;
    }
    list.insertBefore(drag.placeholder, importCard || null);
    drag.targetIndex = Number(cards.at(-1).dataset.bgMaterialIndex);
    drag.placement = "after";
  };

  const finishBgMaterialPointerDrag = (event, cancelled = false) => {
    const drag = bgMaterialPointerDrag;
    if (!drag || drag.pointerId !== event.pointerId) return;
    if (drag.moved) {
      suppressBgMaterialClick = true;
      window.setTimeout(() => { suppressBgMaterialClick = false; }, 80);
      drag.sourceCard.remove();
      drag.placeholder?.remove();
      document.body.classList.remove("is-dragging-bg-material");
      if (cancelled) {
        renderBgMaterialList();
      } else if (drag.sourceIndex === drag.targetIndex) {
        renderBgMaterialList();
      } else {
        reorderBgMaterial(drag.sourceIndex, drag.targetIndex, drag.placement);
      }
    }
    bgMaterialPointerDrag = null;
  };
  window.addEventListener("pointermove", positionBgMaterialDrag, true);
  window.addEventListener("pointerup", event => finishBgMaterialPointerDrag(event), true);
  window.addEventListener("pointercancel", event => finishBgMaterialPointerDrag(event, true), true);
  $("#bgMaterialList").ondragstart = event => event.preventDefault();
  $("#bgPreview").onclick = event => {
    const preview = event.target.closest("[data-bg-preview-index]");
    if (preview) {
      const index = Number(preview.dataset.bgPreviewIndex);
      if (event.metaKey || event.ctrlKey) toggleDefaultBgMaterialSelection(index);
      else openBgMaterialInspector(index);
      preview.focus();
    }
  };
  $("#bgPreview").onkeydown = event => {
    if ((event.key === "Delete" || event.key === "Backspace") &&
        event.target.closest("[data-bg-preview-index]")) {
      event.preventDefault();
      deleteSelectedDefaultBgMaterials();
    }
  };
  $("#bgDeleteSelected").onclick = () => {
    deleteSelectedBgItem();
  };
  $("#bgEffectScale").oninput = () => {
    updateBlueBgLayerScale();
  };
  $("#bgEffectScale").onchange = pushBgHistory;
  $("#bgEffectShadow").onchange = () => {
    updateBlueBgLayerOptions();
    pushBgHistory();
  };
  $("#bgEffectRound").onchange = () => {
    updateBlueBgLayerOptions();
    pushBgHistory();
  };
  $("#bgEffectRoundRadius").oninput = () => {
    updateBlueBgLayerRadius();
  };
  $("#bgEffectRoundRadius").onchange = pushBgHistory;
  $("#bgEffectCorners").onclick = event => {
    const button = event.target.closest("[data-bg-corner]");
    if (!button) return;
    toggleBgCorner(button.dataset.bgCorner);
    pushBgHistory();
  };
  $("#bgCanvasZoom").oninput = () => {
    const stage = $("#blueBgStage");
    const rect = stage.getBoundingClientRect();
    setBlueBgZoomAtPoint(
      Number($("#bgCanvasZoom").value) / 100,
      rect.left + rect.width / 2,
      rect.top + rect.height / 2
    );
    stage.focus();
  };
  $("#imageEditorCanvasZoom").oninput = () => {
    if (!imageEditorState.hasImage) return;
    const canvas = imageEditorCanvas();
    const rect = canvas.getBoundingClientRect();
    setImageEditorZoomAtPoint(
      Number($("#imageEditorCanvasZoom").value) / 100,
      rect.left + rect.width / 2,
      rect.top + rect.height / 2
    );
  };
  [
    ["#bgAddAnnotationNumber", "number"],
    ["#bgAddAnnotationMask", "mask"],
    ["#bgAddAnnotationBlur", "blur"],
    ["#bgAddAnnotationMagnifier", "magnifier"],
    ["#bgAddAnnotationPen", "pen"],
  ].forEach(([selector, mode]) => {
    $(selector).onclick = () => activateBgAnnotationMode(mode);
  });
  $("#bgAnnotationPenWidth").oninput = () => withAnnotationState(bgAnnotationState, updateAnnotationPenWidth);
  $("#bgAnnotationPenWidth").onchange = () => withAnnotationState(bgAnnotationState, pushAnnotationHistory);
  $("#bgAnnotationBlurStrength").oninput = () => withAnnotationState(bgAnnotationState, updateAnnotationBlurStrength);
  $("#bgAnnotationBlurStrength").onchange = () => withAnnotationState(bgAnnotationState, pushAnnotationHistory);
  $("#bgAnnotationMagnifierWidth").oninput = () => withAnnotationState(bgAnnotationState, updateAnnotationMagnifierStyle);
  $("#bgAnnotationMagnifierWidth").onchange = () => withAnnotationState(bgAnnotationState, pushAnnotationHistory);
  $("#bgAnnotationNumberSize").oninput = () => withAnnotationState(bgAnnotationState, updateAnnotationNumberSize);
  $("#bgAnnotationNumberSize").onchange = () => withAnnotationState(bgAnnotationState, pushAnnotationHistory);
  $("#bgAnnotationNumberReset").onclick = () => {
    $("#bgAnnotationNumberSize").value = String(ANNOTATION_NUMBER_SIZE);
    withAnnotationState(bgAnnotationState, updateAnnotationNumberSize);
    pushBgHistory();
  };
  $("#bgAnnotationNumberInput").oninput = () => withAnnotationState(bgAnnotationState, updateBgAnnotationNumberValue);
  $("#bgAnnotationNumberInput").onchange = () => withAnnotationState(bgAnnotationState, () => {
    updateBgAnnotationNumberValue();
    pushAnnotationHistory();
  });
  $("#bgAnnotationInspector").onclick = event => {
    const custom = event.target.closest("[data-annotation-custom-select]");
    if (custom) {
      const kind = custom.dataset.annotationCustomSelect;
      updateBgAnnotationColor(kind, storedBgAnnotationCustomColor(kind));
      pushBgHistory();
      return;
    }
    const button = event.target.closest("[data-annotation-color-kind][data-annotation-color]");
    if (!button) return;
    updateBgAnnotationColor(button.dataset.annotationColorKind, button.dataset.annotationColor);
    pushBgHistory();
  };
  [
    ["#bgAnnotationMaskColor", "mask"],
    ["#bgAnnotationNumberColor", "number"],
    ["#bgAnnotationMagnifierColor", "magnifier"],
    ["#bgAnnotationPenColor", "pen"],
  ].forEach(([selector, kind]) => {
    $(selector).oninput = event => saveBgAnnotationCustomColor(kind, event.target.value);
    $(selector).onchange = () => {
      saveBgAnnotationCustomColor(kind, $(selector).value);
      pushBgHistory();
    };
  });
  ["number", "mask", "blur", "magnifier", "pen"].forEach(kind => {
    const control = $(`#bgAnnotation${kind[0].toUpperCase()}${kind.slice(1)}Shadow`);
    control.onchange = () => {
      updateBgAnnotationShadow(kind, control.checked);
      pushBgHistory();
    };
  });
  $("#bgAnnotationMaskRound").onchange = () => {
    updateBgAnnotationMaskRound();
    pushBgHistory();
  };
  $("#bgAnnotationMaskRoundRadius").oninput = updateBgAnnotationMaskRadius;
  $("#bgAnnotationMaskRoundRadius").onchange = pushBgHistory;
  $("#blueBgStage").oncontextmenu = blueBgContextMenu;
  $("#blueBgStage").ondblclick = event => withAnnotationState(bgAnnotationState, () => annotationDoubleClick(event));
  $("#blueBgStage").onpointerdown = blueBgStagePointerDown;
  $("#blueBgStage").onpointermove = blueBgStagePointerMove;
  $("#blueBgStage").onpointerup = blueBgStagePointerUp;
  $("#blueBgStage").onpointercancel = blueBgStagePointerUp;
  $("#blueBgStage").onpointerleave = () => {
    if (!bgAnnotationState.interaction) hideBgAnnotationPenCursor();
  };
  $("#blueBgMoveUp").onclick = () => moveContextBgMaterial(1);
  $("#blueBgMoveDown").onclick = () => moveContextBgMaterial(-1);
  $("#blueBgEditSelected").onclick = () => {
    openSelectedBlueBgLayerInEditor().catch(error => blueBgStatus(error.message));
  };
  $("#blueBgDeleteMaterial").onclick = () => deleteBgMaterialCompletely();
  $("#blueBgStage").addEventListener("wheel", blueBgWheel, { passive: false });
  $("#blueBgStage").addEventListener("gesturestart", blueBgGestureStart, { passive: false });
  $("#blueBgStage").addEventListener("gesturechange", blueBgGestureChange, { passive: false });
  $("#blueBgStage").onkeydown = blueBgKeyDown;
  $("#imageEditorFile").onchange = event => loadImageEditorFile(event.target.files[0]).catch(err => alert(err.message));
  $("#imageEditorMoveMode").onclick = () => setImageEditorMode("view");
  $("#imageEditorRemoveMode").onclick = () => setImageEditorMode("remove");
  $("#imageEditorInpaintMode").onclick = () => setImageEditorMode("inpaint");
  $("#imageEditorCoverMode").onclick = () => setImageEditorMode("cover");
  $$("#imageEditorCoverControls [data-cover-shape]").forEach(button => {
    button.onclick = () => {
      imageEditorState.coverShape = button.dataset.coverShape === "ellipse" ? "ellipse" : "rect";
      updateImageEditorControls();
      renderImageEditorCanvas();
    };
  });
  $("#imageEditorInpaintSize").oninput = () => {
    imageEditorState.inpaintSize = Number($("#imageEditorInpaintSize").value) || imageEditorState.inpaintSize;
    $("#imageEditorInpaintSizeValue").textContent = `${imageEditorState.inpaintSize} px`;
    refreshImageEditorInpaintCursor();
  };
  $("#imageEditorCropMode").onclick = () => setImageEditorMode("crop");
  $("#imageEditorGradientMode").onclick = () => setImageEditorMode("gradient");
  $("#imageEditorMoreButton").onclick = () => {
    const menu = $("#imageEditorMoreMenu");
    menu.hidden = !menu.hidden;
    $("#imageEditorMoreButton").setAttribute("aria-expanded", String(!menu.hidden));
  };
  $("#imageEditorSplitMode").onclick = () => setImageEditorMode("split");
  $("#imageEditorBlendMode").onclick = () => setImageEditorMode("blend");
  $("#imageEditorWindowMode").onclick = suggestImageEditorWindow;
  $("#imageEditorSecondFileButton").onclick = () => $("#imageEditorSecondFile").click();
  $("#imageEditorSecondFile").onchange = event => {
    loadImageEditorSecondFile(event.target.files[0]).catch(err => alert(err.message));
    event.target.value = "";
  };
  [
    "#imageEditorDividerPosition",
    "#imageEditorDividerAngle",
    "#imageEditorDividerWidth",
    "#imageEditorDividerColor",
    "#imageEditorDividerStyle",
    "#imageEditorBlendWidth",
  ].forEach(selector => {
    $(selector).oninput = renderImageEditorCanvas;
    $(selector).onchange = renderImageEditorCanvas;
  });
  $("#imageEditorApplyComposite").onclick = applyImageEditorComposite;
  $("#imageEditorScreenMode").onclick = () => setImageEditorMode("screen");
  $("#imageEditorScreenFileButton").onclick = () => $("#imageEditorScreenFile").click();
  $("#imageEditorScreenFile").onchange = event => {
    imageEditorScreenLoadFile(event.target.files[0]).catch(err => imageEditorStatus(err.message));
    event.target.value = "";
  };
  const screenParamInputs = [
    ["#imageEditorScreenLight", "light", value => value / 100],
    ["#imageEditorScreenFeather", "feather", Number],
    ["#imageEditorScreenRadius", "radius", Number],
    ["#imageEditorScreenOpacity", "opacity", value => value / 100],
  ];
  screenParamInputs.forEach(([selector, key, convert]) => {
    const input = $(selector);
    input.oninput = () => {
      imageEditorScreen().params[key] = convert(Number(input.value));
      imageEditorScreenSyncParamLabels();
      // 光照/羽化这类参数只有精确合成才看得出来，网格预览不含它们。
      imageEditorScreenSchedule("full");
    };
    input.onchange = () => {
      imageEditorScreen().params[key] = convert(Number(input.value));
      imageEditorScreenSyncParamLabels();
      imageEditorScreenSchedule("full");
      pushImageEditorScreenHistory();
    };
  });
  $("#imageEditorScreenFit").onchange = event => {
    imageEditorScreen().params.fit = event.target.value;
    imageEditorScreenSchedule("full");
    pushImageEditorScreenHistory();
  };
  $("#imageEditorScreenNotch").onchange = event => {
    imageEditorScreen().params.notch = event.target.checked;
    imageEditorScreenSchedule("full");
    pushImageEditorScreenHistory();
  };
  $("#imageEditorScreenSnap").onchange = event => {
    imageEditorScreen().autoSnap = event.target.checked;
  };
  $("#imageEditorScreenHideOverlay").onchange = event => {
    imageEditorScreen().hideOverlay = event.target.checked;
    imageEditorScreenSyncOverlay();
  };
  $("#imageEditorScreenHideShot").onchange = event => {
    imageEditorScreen().hideShot = event.target.checked;
    imageEditorScreenSchedule("full");
    imageEditorStatus(event.target.checked ? "已隐藏贴图，现在看到的是原图。" : "已恢复显示贴图。");
  };
  $("#imageEditorScreenReset").onclick = imageEditorScreenResetCorners;
  $("#imageEditorScreenRefine").onclick = () => {
    const moved = imageEditorScreenRefine();
    if (moved) pushImageEditorScreenHistory();
    imageEditorStatus(moved ? `已吸附精修 ${moved} 个角点。` : "没有找到足够明确的边缘，未做调整。");
  };
  $("#imageEditorConfirmScreen").onclick = imageEditorScreenApply;
  $("#imageEditorCancelScreen").onclick = imageEditorScreenCancel;
  $("#imageEditorScreenOverlayActions").onpointerdown = event => event.stopPropagation();
  $("#imageEditorApplySelection").onclick = applyImageEditorSelection;
  $("#imageEditorCancelSelection").onclick = cancelImageEditorSelection;
  $("#imageEditorApplyGradient").onclick = applyImageEditorGradient;
  $("#imageEditorCancelGradient").onclick = cancelImageEditorGradient;
  $("#imageEditorUndo").onclick = () => runImageEditorHistory(false);
  $("#imageEditorRedo").onclick = () => runImageEditorHistory(true);
  $("#imageEditorExport").onclick = exportImageEditorImage;
  $("#imageEditorStage").onpointerdown = imageEditorPointerDown;
  $("#imageEditorStage").onpointermove = imageEditorPointerMove;
  $("#imageEditorStage").onpointerup = imageEditorPointerUp;
  $("#imageEditorStage").onpointercancel = imageEditorPointerUp;
  $("#imageEditorStage").onscroll = () => {
    syncImageEditorOverlays();
    imageEditorScreenRefreshMagnifier();
  };
  $("#imageEditorStage").onpointerleave = () => {
    hideImageEditorInpaintCursor();
    imageEditorScreenHideMagnifier();
  };
  $("#imageEditorStage").addEventListener("wheel", imageEditorWheel, { passive: false });
  $("#imageEditorStage").addEventListener("gesturestart", imageEditorGestureStart, { passive: false });
  $("#imageEditorStage").addEventListener("gesturechange", imageEditorGestureChange, { passive: false });
  document.addEventListener("keydown", event => {
    if (!$("#imageEditor").classList.contains("active")) return;
    const target = event.target;
    const editing = target?.matches?.('textarea, select, [contenteditable="true"], input:not([type="file"]):not([type="button"]):not([type="checkbox"])');
    if (editing && !(imageEditorState.mode === "screen" && event.key === "Enter")) return;
    imageEditorKeyDown(event);
  });
  document.addEventListener("pointerdown", event => {
    if (!event.target.closest("#blueBgContextMenu")) hideBlueBgContextMenu();
    if (!event.target.closest("#bgChoiceContextMenu")) hideBgChoiceContextMenu();
    if (!event.target.closest("#canvasTabContextMenu")) hideCanvasTabContextMenu();
    if (!event.target.closest(".image-editor-more")) {
      $("#imageEditorMoreMenu").hidden = true;
      $("#imageEditorMoreButton").setAttribute("aria-expanded", "false");
    }
  });
  // 菜单跟着指针出现，页面一动就会失准，这些情况下直接收起。
  document.addEventListener("keydown", event => {
    if (event.key !== "Escape") return;
    if (!$("#canvasTabContextMenu").hidden) hideCanvasTabContextMenu();
  });
  document.addEventListener("scroll", hideCanvasTabContextMenu, true);
  window.addEventListener("resize", hideCanvasTabContextMenu);
  document.addEventListener("wheel", event => {
    if (event.ctrlKey && !event.target.closest(".annotation-stage, .image-editor-stage, .blue-bg-stage")) {
      event.preventDefault();
    }
  }, { passive: false });
  document.addEventListener("gesturestart", event => {
    if (!event.target.closest(".annotation-stage, .image-editor-stage, .blue-bg-stage")) event.preventDefault();
  }, { passive: false });
  document.addEventListener("gesturechange", event => {
    if (!event.target.closest(".annotation-stage, .image-editor-stage, .blue-bg-stage")) event.preventDefault();
  }, { passive: false });
  document.addEventListener("keydown", event => {
    if ((event.metaKey || event.ctrlKey) && ["+", "=", "-", "0"].includes(event.key)) event.preventDefault();
  });
  $("#annotationFile").onchange = event => loadAnnotationImage(event.target.files[0]);
  $("#annotationEmptyImport").onclick = () => $("#annotationFile").click();
  $("#imageEditorEmptyImport").onclick = () => $("#imageEditorFile").click();
  $("#annotationViewMode").onclick = () => setAnnotationMode("view");
  $("#addAnnotationNumber").onclick = () => setAnnotationMode("number");
  $("#addAnnotationMask").onclick = () => setAnnotationMode("mask");
  $("#addAnnotationBlur").onclick = () => setAnnotationMode("blur");
  $("#addAnnotationMagnifier").onclick = () => setAnnotationMode("magnifier");
  $("#annotationBlurStrength").oninput = updateAnnotationBlurStrength;
  $("#annotationBlurStrength").onchange = pushAnnotationHistory;
  $("#annotationMagnifierColor").oninput = updateAnnotationMagnifierStyle;
  $("#annotationMagnifierColor").onchange = pushAnnotationHistory;
  $("#annotationMagnifierWidth").oninput = updateAnnotationMagnifierStyle;
  $("#annotationMagnifierWidth").onchange = pushAnnotationHistory;
  $("#annotationNumberSize").oninput = updateAnnotationNumberSize;
  $("#annotationNumberSize").onchange = pushAnnotationHistory;
  $("#annotationUndo").onclick = () => restoreAnnotationHistory(annotationState.historyIndex - 1);
  $("#annotationRedo").onclick = () => restoreAnnotationHistory(annotationState.historyIndex + 1);
  $("#confirmAnnotationNumber").onclick = confirmAnnotationNumberEdit;
  $("#cancelAnnotationNumber").onclick = closeAnnotationNumberEditor;
  $("#annotationNumberInput").onkeydown = event => {
    if (event.key === "Enter") {
      event.preventDefault();
      confirmAnnotationNumberEdit();
    } else if (event.key === "Escape") {
      event.preventDefault();
      closeAnnotationNumberEditor();
    }
  };
  $("#deleteAnnotation").onclick = deleteSelectedAnnotation;
  $("#exportAnnotation").onclick = exportAnnotationImage;
  $("#annotationStage").onpointerdown = nativeAnnotationStagePointerDown;
  $("#annotationStage").onpointermove = annotationPointerMove;
  $("#annotationStage").onpointerup = annotationPointerUp;
  $("#annotationStage").onpointercancel = annotationPointerUp;
  // 双击要绑在 stage 上：pointerdown 里 stage 会 setPointerCapture，
  // 之后的 dblclick 目标被重定向为 stage，绑在 canvas 上收不到。
  $("#annotationStage").ondblclick = event => withAnnotationState(
    nativeAnnotationState,
    () => annotationDoubleClick(event)
  );
  $("#annotationStage").addEventListener("wheel", annotationWheel, { passive: false });
  $("#annotationStage").addEventListener("gesturestart", annotationGestureStart, { passive: false });
  $("#annotationStage").addEventListener("gesturechange", annotationGestureChange, { passive: false });
  $("#annotationStage").onkeydown = annotationKeyDown;
  document.addEventListener("paste", event => {
    importClipboardImageIntoActiveModule(event).catch(error => {
      const moduleId = activeImageModuleId();
      const message = error?.message || "剪贴板图片导入失败，请重试。";
      if (moduleId === "bg" && $("#bgBlueMode").checked) blueBgStatus(message);
      else if (moduleId === "annotation") annotationStatusText(message);
      else if (moduleId === "imageEditor") imageEditorStatus(message);
    });
  });
  document.addEventListener("keydown", imageModuleGlobalKeyDown);
  document.addEventListener("keyup", event => {
    if (event.key === "Alt") showImageModuleShortcutHints(false);
  });
  window.addEventListener("blur", () => showImageModuleShortcutHints(false));
  window.addEventListener("resize", syncBgMaterialColumnWidth);
  window.addEventListener("resize", scheduleImageEditorInspectorAlign);
  $("#makeButton").onclick = () => makeButtonImage().catch(err => alert(err.message));
  $("#searchProducts").onclick = () => searchProductsAndGenerate().catch(err => $("#productInfoResult").textContent = err.message);
  $("#productKeywords").onkeydown = event => {
    if (event.key === "Enter" && (event.metaKey || event.ctrlKey)) searchProductsAndGenerate().catch(err => $("#productInfoResult").textContent = err.message);
  };
  $("#productMatchList").onclick = event => {
    const button = event.target.closest(".generate-selected-product");
    const group = button?.closest(".product-match-group");
    if (button && group) generateSelectedProduct(group, button).catch(err => $("#productInfoResult").textContent = err.message);
  };
  $("#buttonResultList").onclick = async event => {
    const card = event.target.closest(".button-result-card");
    if (!card) return;
    const index = state.buttonResults.findIndex(item => item.id === Number(card.dataset.resultId));
    if (index < 0) return;
    const item = state.buttonResults[index];
    if (event.target.closest(".copy-button-result-link")) {
      await navigator.clipboard.writeText(item.url);
      event.target.textContent = "已复制";
    } else if (event.target.closest(".download-button-result")) {
      downloadBlob(item.blob, item.filename);
    } else if (event.target.closest(".remove-button-result")) {
      if (item.previewUrl) URL.revokeObjectURL(item.previewUrl);
      state.buttonResults.splice(index, 1);
      renderButtonResults();
    }
  };
  $("#fetchProductInfo").onclick = () => fetchProductInfo().catch(err => $("#productInfoResult").textContent = err.message);
  $("#scanProductQr").onclick = () => scanProductQr().catch(err => $("#productInfoResult").textContent = err.message);
  $("#productDescriptionSearch").oninput = renderProductDescriptions;
  $("#pendingDescriptionsOnly").onchange = renderProductDescriptions;
  $("#usedDescriptionsOnly").onchange = renderProductDescriptions;
  $("#addProductDescription").onclick = () => addProductDescriptionFromUrl().catch(err => $("#productDescriptionResult").textContent = err.message);
  $("#productDescriptionUrl").onkeydown = event => {
    if (event.key === "Enter") addProductDescriptionFromUrl().catch(err => $("#productDescriptionResult").textContent = err.message);
  };
  $("#scanProductDescriptions").onclick = () => scanProductDescriptions().catch(err => $("#productDescriptionResult").textContent = err.message);
  $("#previewTopProductDescriptions").onclick = () => previewTopProductDescriptions().catch(err => $("#productDescriptionResult").textContent = err.message);
  $("#productDescriptionList").onclick = event => {
    const card = event.target.closest(".product-description-card");
    if (!card) return;
    if (event.target.closest(".save-product-description")) {
      saveProductDescription(card).catch(err => $("#productDescriptionResult").textContent = err.message);
    }
    if (event.target.closest(".skip-product-description")) {
      skipProductDescription(card).catch(err => $("#productDescriptionResult").textContent = err.message);
    }
    if (event.target.closest(".preview-product-description")) {
      previewProductDescription(card).catch(err => $("#productDescriptionResult").textContent = err.message);
    }
  };
  $("#productDescriptionList").oninput = event => {
    const card = event.target.closest(".product-description-card");
    if (card && event.target.classList.contains("product-description-manual")) {
      const manualMode = $(`input[name="mode-${CSS.escape(card.dataset.key)}"][value="manual"]`, card);
      if (manualMode) manualMode.checked = true;
    }
    if (card) updateProductDescriptionTitle(card);
  };
  $("#productDescriptionList").onchange = event => {
    const card = event.target.closest(".product-description-card");
    if (card) updateProductDescriptionTitle(card);
  };
  $("#shutdownToolbox").onclick = () => shutdownToolbox();
  window.setInterval(animateMarchingAnts, 120);
}

bind();
initializeBgAnnotationCustomColors();
openBgBackgroundDialog();
toggleBlueBgMode();
createBgTab();
createImageEditorTab();
showTab("bg");
