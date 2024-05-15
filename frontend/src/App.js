import {BrowserRouter, Link, Route, Routes} from "react-router-dom";
import ProductScreen from "./screens/productScreens/ProductScreen";
import Navbar from "react-bootstrap/Navbar";
import Container from "react-bootstrap/Container";
import NavDropdown from "react-bootstrap/NavDropdown";
import {LinkContainer} from "react-router-bootstrap";
import Badge from "react-bootstrap/Badge";
import Nav from "react-bootstrap/Nav";
import {useContext, useState} from "react";
import {Store} from "./Store";
import CartScreen from "./screens/cartScreens/CartScreen";
import SignInScreen from "./screens/userScreens/SignInScreen";
import {ToastContainer} from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import ShippingAddressScreen from "./screens/cartScreens/ShippingAddressScreen";
import SignUpScreen from "./screens/userScreens/SignUpScreen";
import PlaceOrderScreen from "./screens/cartScreens/PlaceOrderScreen";
import OrderScreen from "./screens/cartScreens/OrderScreen";
import OrderHistoryScreen from "./screens/userScreens/OrderHistoryScreen";
import ProfileScreen from "./screens/userScreens/ProfileScreen";
import SearchBar from "./components/SearchBar";
import SearchScreen from "./screens/productScreens/SearchScreen";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminRoute from "./components/AdminRoute";
import ProductListScreen from "./screens/adminScreens/ProductListScreen";
import ProductEditScreen from "./screens/adminScreens/ProductEditScreen";
import OrderListScreen from "./screens/adminScreens/OrderListScreen";
import UserListScreen from "./screens/adminScreens/UserListScreen";
import UserEditScreen from "./screens/adminScreens/UserEditScreen";
import BouquetsScreen from "./screens/productScreens/BouquetsScreen";
import CreateBouquetScreen from "./screens/productScreens/CreateBouquetScreen";
import FlowerScreen from "./screens/productScreens/FlowerScreen";
import PackingScreen from "./screens/productScreens/PackingScreen";

function App() {
    // Accessing global state and dispatch function from Store context
    const {state, dispatch: ctxDispatch} = useContext(Store);
    // Destructuring state variables
    const {fullBox, cart, userInfo} = state;

    // Function to handle user signout
    const signoutHandler = () => {
        // Dispatching user signout action
        ctxDispatch({type: "USER_SIGNOUT"});
        // Removing user info from localStorage
        localStorage.removeItem("userInfo");
        // Removing shipping address from localStorage
        localStorage.removeItem("shippingAddress");
        // Removing payment method from localStorage
        localStorage.removeItem("paymentMethod");
        // Redirecting to signin page
        window.location.href = "/signin";
    };
    const [sidebarIsOpen, setSidebarIsOpen] = useState(false);


// Rendering the app with routing and components
    return (
        <BrowserRouter>
            <div
                className={
                    sidebarIsOpen
                        ? fullBox
                            ? "site-container active-cont d-flex flex-column full-box"
                            : "site-container active-cont d-flex flex-column"
                        : fullBox
                            ? "site-container d-flex flex-column full-box"
                            : "site-container d-flex flex-column"
                }
            >
                <ToastContainer position="bottom-center" limit={1}/>
                <header>
                    <Navbar className="navbar-custom"
                            variant="dark" expand="lg">
                        <Container>

                            <LinkContainer to="/">
                                <Navbar.Brand>FlowerShop</Navbar.Brand>
                            </LinkContainer>
                            <Navbar.Toggle aria-controls="basic-navbar-nav"/>
                            <Navbar.Collapse id="basic-navbar-nav">
                                <SearchBar/>
                                <Nav className="me-auto  w-100  justify-content-end">
                                    <Link to="/cart" className="nav-link">
                                        Cart
                                        {cart.cartItems.length > 0 && (
                                            <Badge pill bg="danger">
                                                {cart.cartItems.reduce((a, c) => a + c.quantity, 0)}
                                            </Badge>
                                        )}
                                    </Link>
                                    <Link to="/createbouquet" className="nav-link">
                                        Create bouquet
                                    </Link>
                                    <Link to="/" className="nav-link">
                                        Bouquets
                                    </Link>
                                    {userInfo ? (
                                        <NavDropdown title={userInfo.name} id="basic-nav-dropdown">
                                            <LinkContainer to="/profile">
                                                <NavDropdown.Item>User Profile</NavDropdown.Item>
                                            </LinkContainer>
                                            <LinkContainer to="/orderhistory">
                                                <NavDropdown.Item>Order History</NavDropdown.Item>
                                            </LinkContainer>
                                            <NavDropdown.Divider/>
                                            <Link
                                                className="dropdown-item"
                                                to="#signout"
                                                onClick={signoutHandler}
                                            >
                                                Sign Out
                                            </Link>
                                        </NavDropdown>
                                    ) : (
                                        <Link className="nav-link" to="/signin">
                                            Sign In
                                        </Link>
                                    )}
                                    {userInfo && userInfo.isAdmin && (
                                        <NavDropdown title="Admin" id="admin-nav-dropdown">

                                            <LinkContainer to="/admin/products">
                                                <NavDropdown.Item>Products</NavDropdown.Item>
                                            </LinkContainer>
                                            <LinkContainer to="/admin/orders">
                                                <NavDropdown.Item>Orders</NavDropdown.Item>
                                            </LinkContainer>
                                            <LinkContainer to="/admin/users">
                                                <NavDropdown.Item>Users</NavDropdown.Item>
                                            </LinkContainer>
                                        </NavDropdown>
                                    )}
                                </Nav>
                            </Navbar.Collapse>
                        </Container>
                    </Navbar>
                </header>

                <main>

                    <div className="mt-3">
                        <Routes>
                            <Route path="/product/:slug" element={<ProductScreen/>}/>
                            <Route path="/flower/:slug" element={<FlowerScreen/>}/>
                            <Route path="/packing/:slug" element={<PackingScreen/>}/>
                            <Route path="/cart" element={<CartScreen/>}/>
                            <Route path="/signin" element={<SignInScreen/>}/>
                            <Route path="/signup" element={<SignUpScreen/>}/>
                            <Route path="/createbouquet" element={<CreateBouquetScreen/>}/>
                            <Route
                                path="/profile"
                                element={
                                    <ProtectedRoute>
                                        <ProfileScreen/>
                                    </ProtectedRoute>
                                }
                            />
                            <Route path="/shipping" element={<ShippingAddressScreen/>}/>
                            <Route path="/placeorder" element={<PlaceOrderScreen/>}/>
                            <Route
                                path="/order/:id"
                                element={
                                    <ProtectedRoute>
                                        <OrderScreen/>
                                    </ProtectedRoute>
                                }
                            ></Route>
                            <Route path="/search" element={<SearchScreen/>}></Route>
                            <Route
                                path="/orderhistory"
                                element={
                                    <ProtectedRoute>
                                        <OrderHistoryScreen/>
                                    </ProtectedRoute>
                                }
                            ></Route>

                            <Route
                                path="/admin/products"
                                element={
                                    <AdminRoute>
                                        <ProductListScreen/>
                                    </AdminRoute>
                                }
                            ></Route>

                            <Route
                                path="/admin/edit/:type/:id"
                                element={
                                    <AdminRoute>
                                        <ProductEditScreen/>
                                    </AdminRoute>
                                }
                            ></Route>
                            <Route
                                path="/admin/orders"
                                element={
                                    <AdminRoute>
                                        <OrderListScreen/>
                                    </AdminRoute>
                                }
                            ></Route>
                            <Route
                                path="/admin/users"
                                element={
                                    <AdminRoute>
                                        <UserListScreen/>
                                    </AdminRoute>
                                }
                            ></Route>
                            <Route
                                path="/admin/user/:id"
                                element={
                                    <AdminRoute>
                                        <UserEditScreen/>
                                    </AdminRoute>
                                }
                            ></Route>
                            <Route path="/" element={<BouquetsScreen/>}/>
                        </Routes>
                    </div>
                </main>
                <footer>
                    {/*<div className="text-center">All Rights Reserved</div>*/}
                </footer>
            </div>
        </BrowserRouter>
    );

}

export default App;

