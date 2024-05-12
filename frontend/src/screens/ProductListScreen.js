import React, { useContext, useEffect, useReducer } from 'react';
import axios from 'axios';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Store } from '../Store';
import LoadingBox from '../components/LoadingBox';
import MessageBox from '../components/MessageBox';
import { toast } from 'react-toastify';
import { getError } from './utils';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Button from 'react-bootstrap/Button';

const reducer = (state, action) => {
  switch (action.type) {
    case 'FETCH_REQUEST':
      return { ...state, loading: true };
    case 'FETCH_SUCCESS':
      return {
        ...state,
        products: action.payload.products,
        flowers: action.payload.flowers,
        // packings: action.payload.packings,
        page: action.payload.page,
        pages: action.payload.pages,
        loading: false,
      };
    case 'FETCH_FAIL':
      return { ...state, loading: false, error: action.payload };
    case 'CREATE_REQUEST':
      return { ...state, loadingCreate: true };
    case 'CREATE_SUCCESS':
      return {
        ...state,
        loadingCreate: false,
      };
    case 'CREATE_FAIL':
      return { ...state, loadingCreate: false };
    case 'DELETE_REQUEST':
      return { ...state, loadingDelete: true, successDelete: false };
    case 'DELETE_SUCCESS':
      return {
        ...state,
        loadingDelete: false,
        successDelete: true,
      };
    case 'DELETE_FAIL':
      return { ...state, loadingDelete: false, successDelete: false };

    case 'DELETE_RESET':
      return { ...state, loadingDelete: false, successDelete: false };

    default:
      return state;
  }
};

export default function ProductListScreen() {
  const [
    {
      loading,
      error,
      products,
      flowers,
      // packings,
      pages,
      loadingCreate,
      loadingDelete,
      successDelete,
    },
    dispatch,
  ] = useReducer(reducer, {
    loading: true,
    error: '',
  });

  const navigate = useNavigate();
  const { search } = useLocation();
  const sp = new URLSearchParams(search);
  const page = sp.get('page') || 1;

  const { state } = useContext(Store);
  const { userInfo } = state;

  useEffect(() => {
    const fetchData = async () => {
      try {
        console.log('Fetching products...');
        const { data } = await axios.get(`/api/products/admin?page=${page}`, {
          headers: { Authorization: `Bearer ${userInfo.token}` },
        });
        console.log('Received products:', data);

        console.log('Fetching flowers...');
        const { data: flowerData } = await axios.get(`/api/flowers/admin?page=${page}`, {
          headers: { Authorization: `Bearer ${userInfo.token}` },
        });
        console.log('Received flowers:', flowerData);

        // console.log('Fetching packings...');
        // const { data: packingData } = await axios.get(`/api/packings/admin?page=${page}`, {
        //   headers: { Authorization: `Bearer ${userInfo.token}` },
        // });
        // console.log('Received packings:', packingData);

        dispatch({ type: 'FETCH_SUCCESS', payload: { products: data.products, flowers: flowerData.flowers } });
      } catch (err) {
        dispatch({ type: 'FETCH_FAIL', payload: getError(err) });
      }
    };
    if (successDelete) {
      dispatch({ type: 'DELETE_RESET' });
    } else {
      fetchData();
    }
  }, [page, userInfo, successDelete]);

  const createHandler = async () => {
    if (window.confirm('Are you sure to create?')) {
      try {
        dispatch({ type: 'CREATE_REQUEST' });
        const { data } = await axios.post(
            '/api/products',
            {},
            {
              headers: { Authorization: `Bearer ${userInfo.token}` },
            }
        );
        toast.success('product created successfully');
        dispatch({ type: 'CREATE_SUCCESS' });
        navigate(`/admin/product/${data.product._id}`);
      } catch (err) {
        toast.error(getError(err));
        dispatch({
          type: 'CREATE_FAIL',
        });
      }
    }
  };

  const deleteHandler = async (product) => {
    if (window.confirm('Are you sure to delete?')) {
      try {
        await axios.delete(`/api/products/${product._id}`, {
          headers: { Authorization: `Bearer ${userInfo.token}` },
        });
        toast.success('product deleted successfully');
        dispatch({ type: 'DELETE_SUCCESS' });
      } catch (err) {
        toast.error(getError(err));
        dispatch({
          type: 'DELETE_FAIL',
        });
      }
    }
  };

  return (
      <div>
        <Row>
          <Col>
            <h1>Products</h1>
          </Col>
          <Col className="col text-end">
            <div>
              <Button variant="outline-primary" type="button" onClick={createHandler}>
                Create Product
              </Button>
            </div>
          </Col>
        </Row>

        {loadingCreate && <LoadingBox></LoadingBox>}
        {loadingDelete && <LoadingBox></LoadingBox>}
        {loading ? (
            <LoadingBox></LoadingBox>
        ) : error ? (
            <MessageBox variant="danger">{error}</MessageBox>
        ) : (
            <>
              <table className="table">
                <thead>
                <tr>
                  <th>ID</th>
                  <th>NAME</th>
                  <th>TYPE</th>
                  <th>PRICE</th>
                  <th>ACTIONS</th>
                </tr>
                </thead>
                <tbody>
                {products.map((product) => (
                    <tr key={product._id}>
                      <td>{product._id}</td>
                      <td>{product.name}</td>
                      <td>BOUQUET</td>
                      <td>{product.price}</td>
                      <td>
                        <Button
                            type="button"
                            variant="success"
                            onClick={() => navigate(`/admin/product/${product._id}`)}
                        >
                          <i className="fas fa-edit"></i>
                        </Button>

                        <Button
                            type="button"
                            variant="danger"
                            onClick={() => deleteHandler(product)}
                        >
                          <i className="fas fa-trash"></i>
                        </Button>
                      </td>
                    </tr>
                ))}

                {flowers && flowers.length > 0 && flowers.map((flower) => (
                    <tr key={flower._id}>
                      <td>{flower._id}</td>
                      <td>{flower.name}</td>
                      <td>FLOWER</td>
                      <td>{flower.price}</td>
                      <td>
                        <Button
                            type="button"
                            variant="success"
                            onClick={() => navigate(`/admin/flower/${flower._id}`)}
                        >
                          <i className="fas fa-edit"></i>
                        </Button>

                        <Button
                            type="button"
                            variant="danger"
                            onClick={() => deleteHandler(flower)}
                        >
                          <i className="fas fa-trash"></i>
                        </Button>
                      </td>
                    </tr>
                ))}
                {/*{packings && packings.length > 0 && packings.map((packing) => (*/}
                {/*    <tr key={packing._id}>*/}
                {/*      <td>{packing._id}</td>*/}
                {/*      <td>{packing.name}</td>*/}
                {/*      <td>PACKING</td>*/}
                {/*      <td>{packing.price}</td>*/}
                {/*      <td>*/}
                {/*        <Button*/}
                {/*            type="button"*/}
                {/*            variant="success"*/}
                {/*            onClick={() => navigate(`/admin/packing/${packing._id}`)}*/}
                {/*        >*/}
                {/*          <i className="fas fa-edit"></i>*/}
                {/*        </Button>*/}

                {/*        <Button*/}
                {/*            type="button"*/}
                {/*            variant="danger"*/}
                {/*            onClick={() => deleteHandler(packing)}*/}
                {/*        >*/}
                {/*          <i className="fas fa-trash"></i>*/}
                {/*        </Button>*/}
                {/*      </td>*/}
                {/*    </tr>*/}
                {/*))}*/}
                </tbody>


              </table>
              <div>
                {[...Array(pages).keys()].map((x) => (
                    <Link
                        className={x + 1 === Number(page) ? 'btn text-bold' : 'btn'}
                        key={x + 1}
                        to={`/admin/products?page=${x + 1}`}
                    >
                      {x + 1}
                    </Link>
                ))}
              </div>
            </>
        )}
      </div>
  );
}
