import { createContext, useReducer } from 'react';

export const Store = createContext();

const initialState = {
  fullBox: false,
  userInfo: localStorage.getItem('userInfo')
    ? JSON.parse(localStorage.getItem('userInfo'))
    : null,

  cart: {
    shippingAddress: localStorage.getItem('shippingAddress')
      ? JSON.parse(localStorage.getItem('shippingAddress'))
      : { location: {} },
    paymentMethod: localStorage.getItem('paymentMethod')
      ? localStorage.getItem('paymentMethod')
      : '',
    cartItems: localStorage.getItem('cartItems')
      ? JSON.parse(localStorage.getItem('cartItems'))
      : [],
  },
};
// This function takes the current state and an action as parameters.
function reducer(state, action) {
  // It checks the type of action.
  switch (action.type) {
      // If the action type is 'SET_FULLBOX_ON',
    case 'SET_FULLBOX_ON':
      // it returns a new state with 'fullBox' set to true.
      return { ...state, fullBox: true };
// If the action type is 'SET_FULLBOX_OFF',
      case 'SET_FULLBOX_OFF':
        // it returns a new state with 'fullBox' set to false.
        return { ...state, fullBox: false };
// If the action type is 'CART_ADD_ITEM',
      // it adds an item to the shopping cart.
    case 'CART_ADD_ITEM':
      // It extracts the new item from the action payload.
      const newItem = action.payload;
      // It checks if the new item already exists in the cart.
      const itemExist = state.cart.cartItems.find(
        (item) => item._id === newItem._id
      );
      // It updates the cart items: either updates the quantity of an existing item or adds a new item.
      const cartItems = itemExist
        ? state.cart.cartItems.map((item) =>
            item._id === itemExist._id ? newItem : item
          )
        : [...state.cart.cartItems, newItem];
      // It saves the updated cart items to the browser's localStorage.
      localStorage.setItem('cartItems', JSON.stringify(cartItems));
      // It returns a new state with the updated cart items.
      return { ...state, cart: { ...state.cart, cartItems } };
      // If the action type is 'CART_REMOVE_ITEM',
      // it removes an item from the shopping cart.
    case 'CART_REMOVE_ITEM': {
      // It filters out the item to be removed from the cart items array.
      const cartItems = state.cart.cartItems.filter(
        (item) => item._id !== action.payload._id
      );
      // It saves the updated cart items to the browser's localStorage.
      localStorage.setItem('cartItems', JSON.stringify(cartItems));
      // It returns a new state with the updated cart items.
      return { ...state, cart: { ...state.cart, cartItems } };
    }
      // If the action type is 'CART_CLEAR',
      // it clears all items from the shopping cart.
    case 'CART_CLEAR':
      // It returns a new state with an empty cart items array.
      return { ...state, cart: { ...state.cart, cartItems: [] } };
// If the action type is 'USER_SIGNIN',
      // it updates the user information upon signing in.
    case 'USER_SIGNIN':
      // It returns a new state with the updated user information.
      return { ...state, userInfo: action.payload };
// If the action type is 'USER_SIGNOUT',
      // it clears the user information and empties the cart upon signing out.
    case 'USER_SIGNOUT':
      return {
        // It returns a new state with cleared user information and an empty cart.
        ...state,
        userInfo: null,
        cart: {
          cartItems: [],
          shippingAddress: {},
          paymentMethod: '',
        },
      };

    case 'SAVE_SHIPPING_ADDRESS':
      return {
        ...state,
        cart: {
          ...state.cart,
          shippingAddress: action.payload,
        },
      };
    case 'SAVE_SHIPPING_ADDRESS_MAP_LOCATION':
      return {
        ...state,
        cart: {
          ...state.cart,
          shippingAddress: {
            ...state.cart.shippingAddress,
            location: action.payload,
          },
        },
      };

    case 'SAVE_PAYMENT_METHOD':
      return {
        ...state,
        cart: { ...state.cart, paymentMethod: action.payload },
      };

    default:
      return state;
  }
}
export function StoreProvider(props) {
  const [state, dispatch] = useReducer(reducer, initialState);
  const value = { state, dispatch };
  return <Store.Provider value={value}>{props.children}</Store.Provider>;
}
