// 間取り図や外部リンク（#kaede など）から来たとき、該当の標準和室を開く
function openRoomFromHash() {
  const id = window.location.hash.slice(1);
  if (!id) return;
  const target = document.getElementById(id);
  if (target && target.tagName === "DETAILS") target.open = true;
}

openRoomFromHash();
window.addEventListener("hashchange", openRoomFromHash);
