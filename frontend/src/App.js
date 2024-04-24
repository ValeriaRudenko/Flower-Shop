import { BrowserRouter, Link, Route, Routes } from "react-router-dom";
import HomeScreen from "./screens/HomeScreen";
import ProductScreen from "./screens/ProductScreen";
import Navbar from "react-bootstrap/Navbar";
import Container from "react-bootstrap/Container";
import NavDropdown from "react-bootstrap/NavDropdown";
import { LinkContainer } from "react-router-bootstrap";
import Badge from "react-bootstrap/Badge";
import Nav from "react-bootstrap/Nav";
import { useContext, useEffect, useState } from "react";
import { Store } from "./Store";
import CartScreen from "./screens/CartScreen";
import SigninScreen from "./screens/SigninScreen";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import ShippingAddressScreen from "./screens/ShippingAddressScreen";
import SignupScreen from "./screens/SignupScreen";
import PaymentMethodScreen from "./screens/PaymentMethodScreen";
import PlaceOrderScreen from "./screens/PlaceOrderScreen";
import OrderScreen from "./screens/OrderScreen";
import OrderHistoryScreen from "./screens/OrderHistoryScreen";
import ProfileScreen from "./screens/ProfileScreen";
import Button from "react-bootstrap/Button";
import { getError } from "./screens/utils";
import axios from "axios";
import SearchBar from "./components/SearchBar";
import SearchScreen from "./screens/SearchScreen";
import ProtectedRoute from "./components/ProtectedRoute";
import DashboardScreen from "./screens/DashboardScreen";
import AdminRoute from "./components/AdminRoute";
import ProductListScreen from "./screens/ProductListScreen";
import ProductEditScreen from "./screens/ProductEditScreen";
import OrderListScreen from "./screens/OrderListScreen";
import UserListScreen from "./screens/UserListScreen";
import UserEditScreen from "./screens/UserEditScreen";
import MapScreen from "./screens/MapScreen";
import BouquetsScreen from "./screens/BouquetsScreen";
import CreateBouquetScreen from "./screens/CreateBouquetScreen";

function App() {
  const {state, dispatch: ctxDispatch} = useContext(Store);
  const {fullBox, cart, userInfo} = state;

  const signoutHandler = () => {
    ctxDispatch({type: "USER_SIGNOUT"});
    localStorage.removeItem("userInfo");
    localStorage.removeItem("shippingAddress");
    localStorage.removeItem("paymentMethod");
    window.location.href = "/signin";
  };

  const [sidebarIsOpen, setSidebarIsOpen] = useState(false);
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const {data} = await axios.get(`/api/products/categories`);
        setCategories(data);
      } catch (error) {
        toast.error(getError(error));
      }
    };
    fetchCategories();
  }, []);

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
                    <Link to="/bouquets" className="nav-link">
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
                          <LinkContainer to="/admin/dashboard">
                            <NavDropdown.Item>Dashboard</NavDropdown.Item>
                          </LinkContainer>
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
                <Route path="/cart" element={<CartScreen/>}/>
                <Route path="/signin" element={<SigninScreen/>}/>
                <Route path="/signup" element={<SignupScreen/>}/>
                <Route path="/bouquets" element={<BouquetsScreen/>}/>
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
                <Route path="/payment" element={<PaymentMethodScreen/>}></Route>
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
                    path="/admin/dashboard"
                    element={
                      <AdminRoute>
                        <DashboardScreen/>
                      </AdminRoute>
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
                    path="/admin/product/:id"
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
                <Route
                    path="/map"
                    element={
                      <ProtectedRoute>
                        <MapScreen/>
                      </ProtectedRoute>
                    }
                />
                <Route path="/" element={<HomeScreen/>}/>
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

