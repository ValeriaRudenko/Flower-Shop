// Importing necessary modules from React and related packages
import React, {useEffect, useReducer} from 'react';
import {useLocation} from 'react-router-dom';
import axios from '../../instance';
import {getError} from '../utils';
import {Helmet} from 'react-helmet-async';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import LoadingBox from '../../components/LoadingBox';
import MessageBox from '../../components/MessageBox';
import Button from 'react-bootstrap/Button';
import LinkContainer from 'react-router-bootstrap/LinkContainer';

import ProductCard from "../../components/ProductCard";

// Reducer function to manage state
const reducer = (state, action) => {
    switch (action.type) {
        // Set loading to true when fetching data
        case 'FETCH_REQUEST':
            return {...state, loading: true};
        // Update state with fetched data when request succeeds
        case 'FETCH_SUCCESS':
            return {
                ...state,
                products: action.payload.products,
                flowers: action.payload2.flowers,
                packings: action.payload3.packings,
                page: action.payload.page,
                pages: action.payload.pages,
                countProducts: action.payload.countProducts,
                loading: false,
            };
        // Handle fetch failure
        case 'FETCH_FAIL':
            return {...state, loading: false, error: action.payload};
        // Default case for reducer
        default:
            return state;
    }
};

// Array of price ranges
// const prices = [
//   {
//     name: '$1 to $50',
//     value: '1-50',
//   },
//   {
//     name: '$51 to $200',
//     value: '51-200',
//   },
//   {
//     name: '$201 to $1000',
//     value: '201-1000',
//   },
// ];

// Array of rating options
// export const ratings = [
//   {
//     name: '4stars & up',
//     rating: 4,
//   },
//   {
//     name: '3stars & up',
//     rating: 3,
//   },
//   {
//     name: '2stars & up',
//     rating: 2,
//   },
//   {
//     name: '1stars & up',
//     rating: 1,
//   },
// ];

// Main component function for search screen
export default function SearchScreen() {
    const {search} = useLocation();
    const sp = new URLSearchParams(search);
    const query = sp.get('query') || 'all';
    const price = sp.get('price') || 'all';
    const rating = sp.get('rating') || 'all';
    const order = sp.get('order') || 'newest';
    const page = sp.get('page') || 1;

    // Reducer hook to manage state
    const [{loading, error, products, flowers, packings, pages}, dispatch] =
        useReducer(reducer, {
            loading: true,
            error: '',
        });

    // Effect hook to fetch data when component mounts or dependencies change
    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch products data
                const {data} = await axios.get(
                    `/api/products/search?page=${page}&query=${query}&price=${price}&rating=${rating}&order=${order}`
                );
                // Fetch flowers data
                const {data: data2} = await axios.get(
                    `/api/flowers/search?page=${page}&query=${query}&price=${price}&rating=${rating}&order=${order}/`
                );
                // Fetch packings data
                const {data: data3} = await axios.get(
                    `/api/packings/search?page=${page}&query=${query}&price=${price}&rating=${rating}&order=${order}/`
                );
                // Dispatch success action with fetched data
                dispatch({type: 'FETCH_SUCCESS', payload: data, payload2: data2, payload3: data3});
            } catch (err) {
                // Dispatch failure action with error message
                dispatch({
                    type: 'FETCH_FAIL',
                    payload: getError(error),
                });
            }
        };
        // Call fetchData function
        fetchData();
    }, [error, order, page, price, query, rating]);

    // Function to generate filter URL based on filter options
    const getFilterUrl = (filter) => {
        const filterPage = filter.page || page;
        const filterQuery = filter.query || query;
        const filterRating = filter.rating || rating;
        const filterPrice = filter.price || price;
        const sortOrder = filter.order || order;
        return `/search?query=${filterQuery}&price=${filterPrice}&rating=${filterRating}&order=${sortOrder}&page=${filterPage}`;
    };

    // Return JSX for search screen component
    return (
        <div>
            {/* Helmet for managing document head */}
            <Helmet>
                <title>Search Products</title>
            </Helmet>
            {/* Row for layout */}
            <Row>
                {/* Column for department filters */}
                <Col md={3}>

                    {/* Filter options for price */}
                    {/*<div>*/}
                    {/*<h3>Price</h3>*/}
                    {/*<ul>*/}
                    {/*  <li>*/}
                    {/* Link for all price ranges */}
                    {/*  <Link*/}
                    {/*      className={'all' === price ? 'text-bold' : ''}*/}
                    {/*      to={getFilterUrl({ price: 'all' })}*/}
                    {/*  >*/}
                    {/*    Any*/}
                    {/*  </Link>*/}
                    {/*</li>*/}
                    {/* Mapping through price ranges */}
                    {/*{prices.map((p) => (*/}
                    {/*    <li key={p.value}>*/}
                    {/*      /!* Link for each price range *!/*/}
                    {/*      <Link*/}
                    {/*          to={getFilterUrl({ price: p.value })}*/}
                    {/*          className={p.value === price ? 'text-bold' : ''}*/}
                    {/*      >*/}
                    {/*        {p.name}*/}
                    {/*      </Link>*/}
                    {/*    </li>*/}
                    {/*))}*/}
                    {/*  </ul>*/}
                    {/*</div>*/}
                    {/* Filter options for average customer review */}
                    {/*<div>*/}
                    {/*  <h3>Avg. Customer Review</h3>*/}
                    {/*  <ul>*/}
                    {/* Mapping through rating options */}
                    {/*{ratings.map((r) => (*/}
                    {/*    <li key={r.name}>*/}
                    {/* Link for each rating option */}
                    {/*<Link*/}
                    {/*    to={getFilterUrl({ rating: r.rating })}*/}
                    {/*    className={`${r.rating}` === `${rating}` ? 'text-bold' : ''}*/}
                    {/*>*/}
                    {/*  <Rating caption={' & up'} rating={r.rating}></Rating>*/}
                    {/*</Link>*/}
                    {/*    </li>*/}
                    {/*))}*/}
                    {/* Link for all ratings */}
                    {/*<li>*/}
                    {/*  <Link*/}
                    {/*      to={getFilterUrl({ rating: 'all' })}*/}
                    {/*      className={rating === 'all' ? 'text-bold' : ''}*/}
                    {/*  >*/}
                    {/*    <Rating caption={' & up'} rating={0}></Rating>*/}
                    {/*  </Link>*/}
                    {/*</li>*/}
                    {/*  </ul>*/}
                    {/*</div>*/}
                </Col>
                {/* Column for displaying products */}
                <Col md={9}>
                    {/* Conditionally render loading or error message */}
                    {loading ? (
                        <LoadingBox></LoadingBox>
                    ) : error ? (
                        <MessageBox variant="danger">{error}</MessageBox>
                    ) : (
                        // Render products, filters, and pagination
                        <>
                            {/*<Row className="justify-content-between mb-3">*/}
                            {/*  <Col md={6}>*/}
                            {/*    <div>*/}
                            {/* Display number of results and applied filters */}
                            {/*    {countProducts === 0 ? 'No' : countProducts} Results*/}
                            {/*    {query !== 'all' && ' : ' + query}*/}
                            {/*    {price !== 'all' && ' : Price ' + price}*/}
                            {/*    {rating !== 'all' && ' : Rating ' + rating + ' & up'}*/}
                            {/*    /!* Button to clear filters *!/*/}
                            {/*    {query !== 'all' ||*/}
                            {/*    rating !== 'all' ||*/}
                            {/*    price !== 'all' ? (*/}
                            {/*        <Button*/}
                            {/*            variant="light"*/}
                            {/*            onClick={() => navigate('/search')}*/}
                            {/*        >*/}
                            {/*          <i className="fas fa-times-circle"></i>*/}
                            {/*        </Button>*/}
                            {/*    ) : null}*/}
                            {/*  </div>*/}
                            {/*</Col>*/}
                            {/*</Row>*/}
                            {/* Display message if no products, flowers, or packings found */}
                            {products.length === 0 && (flowers === undefined || flowers.length === 0) && (packings === undefined || packings.length === 0) && (
                                <MessageBox>No Product Found</MessageBox>
                            )}
                            {/* Render products, flowers, and packings */}
                            <Row>
                                {/* Mapping through products and rendering */}
                                {products.map((product) => (
                                    <Col sm={6} lg={4} className="mb-3" key={product._id}>
                                        <ProductCard item={product} type={'product'}></ProductCard>
                                    </Col>
                                ))}
                                {/* Mapping through flowers and rendering */}
                                {flowers !== undefined &&
                                    flowers.map((flower) => (
                                        <Col sm={6} lg={4} className="mb-3" key={flower._id}>
                                            <ProductCard item={flower} type={'flower'}></ProductCard>
                                        </Col>
                                    ))}
                                {/* Mapping through packings and rendering */}
                                {packings !== undefined &&
                                    packings.map((packing) => (
                                        <Col sm={6} lg={4} className="mb-3" key={packing._id}>
                                            <ProductCard item={packing} type={'packing'}></ProductCard>
                                        </Col>
                                    ))}
                            </Row>
                            {/* Pagination */}
                            <div>
                                {[...Array(pages).keys()].map((x) => (
                                    <LinkContainer
                                        key={x + 1}
                                        className="mx-1"
                                        to={{
                                            pathname: "/search",
                                            search: `?query=${query}&price=${price}&rating=${rating}&order=${order}&page=${x + 1}`,
                                        }}
                                    >
                                        <Button
                                            className={Number(page) === x + 1 ? "text-bold" : ""}
                                            variant="light"
                                        >
                                            {x + 1}
                                        </Button>
                                    </LinkContainer>
                                ))}
                            </div>
                        </>
                    )}
                </Col>
            </Row>
        </div>
    );
}
