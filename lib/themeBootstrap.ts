// Runs before first paint so the desktop never flashes the wrong appearance.
export const themeBootstrap = `try{var t=localStorage.getItem("appearance");if(t)document.documentElement.dataset.theme=t}catch(e){}`;
