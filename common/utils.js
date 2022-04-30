// Add zero in front of numbers < 10
export function zeroPad(i) {
  if (i < 10) {
    i = "0" + i;
  }
  return i;
}

export function lpad(s, pad, len) {
  s = s + "";
  while (s.length < len) s = pad + s;
  return s;
}
