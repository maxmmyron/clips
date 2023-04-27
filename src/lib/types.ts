enum DropLocation { PLAYER, TIMELINE };

interface Media {
  src: string;
  duration: number;
  startOffset: number;
  endOffset: number;
  isSelected: boolean;
}

type MediaDragData = {
  src: string,
  duration: number,
}

type MediaPoolFile = {
  src: string;
  name: string;
  isSelected: boolean;
}
