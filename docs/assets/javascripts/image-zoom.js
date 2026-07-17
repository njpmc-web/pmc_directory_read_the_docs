document.addEventListener("click", (event) => {
  const image = event.target.closest("figure img");
  if (!image) return;
  const dialog = document.createElement("dialog");
  dialog.setAttribute("aria-label", image.alt || "Screenshot preview");
  dialog.style.cssText = "max-width:96vw;max-height:96vh;border:0;border-radius:12px;padding:8px;background:#fff";
  const preview = image.cloneNode();
  preview.style.cssText = "display:block;max-width:92vw;max-height:90vh;object-fit:contain;cursor:zoom-out";
  dialog.append(preview);
  document.body.append(dialog);
  dialog.addEventListener("click", () => dialog.close());
  dialog.addEventListener("close", () => dialog.remove());
  dialog.showModal();
});
