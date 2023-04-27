enum DropLocation { PLAYER, TIMELINE };

interface Media {
  src: string;
  duration: number;
  startOffset: number;
  endOffset: number;
  isSelected: boolean;
}

type MediaPoolFile = {
  src: string;
  name: string;
  isSelected: boolean;
}
