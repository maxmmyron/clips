const formats:{[key:string]: string} = {
  'enter': '↲',
  'arrowup': '↑',
  'arrowdown': '↓',
  'arrowleft': '←',
  'arrowright': '→',
  'control': 'Ctrl',
  'shift': '⇧',
  'alt': '⎇',
};

const formatKey = (key: string) => {
  return (formats[key.toLowerCase()] || key).toUpperCase();
}

export default formatKey;
