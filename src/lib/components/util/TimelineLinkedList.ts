

export default class TimelineLinkedList implements App.Timeline {

  head: App.Node | null;
  tail: App.Node | null;

  constructor() {
    this.head = null;
    this.tail = null;
  }

  /**
   * Adds a node to the list at the given index, or at the end of the list if no index is provided.
   *
   * @param node the node to add
   * @returns the node that was added
   */
  add = (node: App.Node, index: number = -1) => {
    if(this.getByUUID(node.uuid)) throw new Error(`A node with the uuid ${node.uuid} already exists in the list.`);

    if(index === 0) {
      node.next = this.head;
      if(this.head) this.head.prev = node;
      this.head = node;
      if(!this.tail) this.tail = node;
    }

    else if(index === -1 || index === this.length) {
      node.prev = this.tail;
      if(this.tail) this.tail.next = node;
      this.tail = node;
      if(!this.head) this.head = node;
    }

    else {
      const curr = this.getByIndex(index);
      if(!curr) throw new Error(`No node exists at index ${index}.`);

      node.next = curr;
      node.prev = curr.prev;
      if(curr.prev) curr.prev.next = node;
      curr.prev = node;
    }
  }

  /**
   * Returns the node with the given uuid, if it exists.
   *
   * @param uuid uuid of the node to get
   * @returns the node with the given uuid, or null if the node was not found
   */
  getByUUID = (uuid: string) => {
    let curr = this.head;

    while(curr) {
      if(curr.uuid === uuid) return curr;
      curr = curr.next;
    }

    return null;
  }

  /**
   * Returns the node at the given index, if it exists.
   *
   * @param index index of the node to get
   * @returns the node at the given index, or null if the node was not found
   */
  getByIndex = (index: number) => {
    if(index < 0 || index >= this.length) throw new Error(`Index ${index} is out of bounds.`);

    let curr = this.head;
    let i = 0;

    while(curr) {
      if(i === index) return curr;
      curr = curr.next;
      i++;
    }

    return null;
  }

  /**
   * Returns the index of the node with the given uuid, if it exists.
   *
   * @param uuid uuid of the node to find
   * @returns the index of the node with the given uuid, or -1 if the node was not found
   *
   */
  indexOf(uuid: string) {
    let curr = this.head;
    let i = 0;

    while(curr) {
      if(curr.uuid === uuid) return i;
      curr = curr.next;
      i++;
    }

    return -1;
  }

  /**
   * Removes and returns a node with the given uuid from the list, if it exists.
   *
   * @param uuid uuid of the node to remove
   * @returns the removed node, or null if the node was not found
   */
  remove = (uuid: string) => {
    const node = this.getByUUID(uuid);

    if(!node) return null;

    if(node.prev) node.prev.next = node.next;
    if(node.next) node.next.prev = node.prev;

    if(node === this.head) this.head = node.next;
    if(node === this.tail) this.tail = node.prev;

    node.next = null;
    node.prev = null;

    return node;
  };

  /**
   * Returns an array of all nodes in the list.
   */
  toArray = () => {
    let arr = [];
    let curr = this.head;
    while(curr) {
      arr.push(curr);
      curr = curr.next;
    }

    return arr;
  }

  get length() {
    let len = 0;
    let curr = this.head;
    while(curr) {
      len++;
      curr = curr.next;
    }

    return len;
  }
}
