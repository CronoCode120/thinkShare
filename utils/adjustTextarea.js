const adjustTextarea = (element) => {
  element.style.height = "1px";
  element.style.height = (25 + element.scrollHeight) + "px";
}

export default adjustTextarea;