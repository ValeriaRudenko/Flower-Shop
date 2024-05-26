import {createContext, useReducer} from 'react';

// Create a context for the global state management.
export const Store = createContext();

// Define the initial state of the application.
const initialState = {
    fullBox: false, // Indicates whether the fullBox is enabled or not.
    userInfo: localStorage.getItem('userInfo') // Get user info from local storage or set to null if not found.
        ? JSON.parse(localStorage.getItem('userInfo'))
        : null,

    // Define the shopping cart state with initial values fetched from local storage or default values.
    cart: {
        bouquetNumber :localStorage.getItem('bouquetNumber')|| 1,
        shippingAddress: localStorage.getItem('shippingAddress')
            ? JSON.parse(localStorage.getItem('shippingAddress'))
            : {location: {}}, // Default shipping address is an empty object with a location property.
        paymentMethod: localStorage.getItem('paymentMethod') || '', // Default payment method is an empty string.
        cartItems: localStorage.getItem('cartItems')
            ? JSON.parse(localStorage.getItem('cartItems'))
            : [], // Default cart items is an empty array.
    },
};

// Reducer function to handle state updates based on dispatched actions.
function reducer(state, action) {
    switch (action.type) {
        // Set fullBox to true.
        case 'SET_FULLBOX_ON':
            return {...state, fullBox: true};
        // Set fullBox to false.
        case 'SET_FULLBOX_OFF':
            return {...state, fullBox: false};
        // Add an item to the cart.
        case 'CART_REMOVE_BOUQUET':
            const storedBouquetNumber = localStorage.getItem('bouquetNumber');
            const updatedCartItems = state.cart.cartItems.filter(
                (item) => item.bouquetNumber !== action.payload
            );
            if(action.payload === storedBouquetNumber){
                localStorage.setItem('bouquetNumber', Number(action.payload)-1);
            }
            localStorage.setItem('cartItems', JSON.stringify(updatedCartItems));
            return {
                ...state,
                cart: {
                    ...state.cart,
                    cartItems: updatedCartItems,
                },
            };
        case 'CART_ADD_ITEM':
            const newItem = action.payload;
            const itemExist = state.cart.cartItems.find(
                (item) => item._id === newItem._id
            );

            if (newItem.type !== "product") {
                if (!itemExist) {
                    newItem.bouquetNumber = Number(localStorage.getItem('bouquetNumber')) || 1;
                } else {
                    newItem.bouquetNumber = itemExist.bouquetNumber; // Changed from item to itemExist
                }
            }

            const cartItems = itemExist
                ? state.cart.cartItems.map((item) =>
                    item._id === itemExist._id ? newItem : item
                )
                : [...state.cart.cartItems, newItem];

            localStorage.setItem('cartItems', JSON.stringify(cartItems));
            return { ...state, cart: { ...state.cart, cartItems } };

        // Remove an item from the cart.
        case 'CART_REMOVE_ITEM':
            const cartItemsRemoved = state.cart.cartItems.filter(
                (item) => item._id !== action.payload._id
            );
            localStorage.setItem('cartItems', JSON.stringify(cartItemsRemoved));
            return {...state, cart: {...state.cart, cartItems: cartItemsRemoved}};
        // Clear the cart.
        case 'CART_CLEAR':
            localStorage.removeItem('cartItems');
            return {...state, cart: {...state.cart, cartItems: []}};
        // Update user info upon sign-in.
        case 'USER_SIGNIN':
            return {...state, userInfo: action.payload};
        case 'ADD_NEW_BOUQUET':
            const lastBouquetNumber = state.cart.cartItems.reduce((acc, item) => {
                if (item.type !== 'product') {
                    return Math.max(acc, item.bouquetNumber);

                }
                return acc;
            }, 0);
            const newBouquetNumber = lastBouquetNumber > 0 ? lastBouquetNumber + 1 : 1;

            localStorage.setItem('bouquetNumber', newBouquetNumber);
            return {...state, cart: {...state.cart, bouquetNumber: newBouquetNumber}};// Clear user info and cart upon sign-out.
        case 'USER_SIGNOUT':
            localStorage.removeItem('userInfo');
            localStorage.removeItem('cartItems');
            localStorage.removeItem('shippingAddress');
            localStorage.removeItem('paymentMethod');
            return {
                ...state,
                userInfo: null,
                cart: {
                    cartItems: [],
                    shippingAddress: {},
                    paymentMethod: '',
                },
            };
        // Save shipping address to the cart.
        case 'SAVE_SHIPPING_ADDRESS':
            return {
                ...state,
                cart: {...state.cart, shippingAddress: action.payload},
            };
        // Save shipping address map location to the cart.
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
        // Save payment method to the cart.
        case 'SAVE_PAYMENT_METHOD':
            return {
                ...state,
                cart: {...state.cart, paymentMethod: action.payload},
            };
        default:
            return state;
    }
}

// Provider component to provide the store state and dispatch function to child components.
export function StoreProvider(props) {
    const [state, dispatch] = useReducer(reducer, initialState);
    const value = {state, dispatch};
    return <Store.Provider value={value}>{props.children}</Store.Provider>;
}
