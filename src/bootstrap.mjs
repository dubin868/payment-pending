const timer=setTimeout(()=>window.showStartupError('加载时间过长，请刷新页面；本地使用请双击“启动工具.cmd”。'),15000);
try {
  await import('./studio.mjs');
} catch(error) {
  window.showStartupError('编辑程序加载失败，请刷新页面或使用“启动工具.cmd”重新打开。'+(error.message?'（'+error.message+'）':''));
} finally {
  clearTimeout(timer);
}
