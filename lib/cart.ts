export type CartItem = {
  productId: string;
  quantity: number;
};

const CART_KEY = "cretofit_cart";

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function isValidUUID(id: unknown): boolean {
  return typeof id === "string" && UUID_REGEX.test(id);
}

function notifyCartUpdated() {
  window.dispatchEvent(new Event("cart-updated"));
}

export function getCartItems(): CartItem[] {
  if (typeof window === "undefined") return [];

  const storedCart = localStorage.getItem(CART_KEY);
  if (!storedCart) return [];

  try {
    return JSON.parse(storedCart);
  } catch {
    return [];
  }
}

export function cleanInvalidCartItems(): CartItem[] {
  if (typeof window === "undefined") return [];

  const all = getCartItems();
  const valid = all.filter((item) => isValidUUID(item.productId));

  if (valid.length < all.length) {
    localStorage.setItem(CART_KEY, JSON.stringify(valid));
    notifyCartUpdated();
  }

  return valid;
}

export function saveCartItems(items: CartItem[]) {
  localStorage.setItem(CART_KEY, JSON.stringify(items));
  notifyCartUpdated();
}

export function getCartCount() {
  return getCartItems().reduce((total, item) => total + item.quantity, 0);
}

export function addToCart(productId: string) {
  const cartItems = getCartItems();
  const existingItem = cartItems.find((item) => item.productId === productId);

  if (existingItem) {
    existingItem.quantity += 1;
  } else {
    cartItems.push({ productId, quantity: 1 });
  }

  saveCartItems(cartItems);
}

export function removeFromCart(productId: string) {
  const updatedCart = getCartItems().filter(
    (item) => item.productId !== productId
  );

  saveCartItems(updatedCart);
}

export function increaseQuantity(productId: string) {
  addToCart(productId);
}

export function decreaseQuantity(productId: string) {
  const cartItems = getCartItems();
  const item = cartItems.find((cartItem) => cartItem.productId === productId);

  if (!item) return;

  if (item.quantity <= 1) {
    removeFromCart(productId);
    return;
  }

  item.quantity -= 1;
  saveCartItems(cartItems);
}