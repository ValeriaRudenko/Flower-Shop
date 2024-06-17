import React from 'react';


function ProductPrice(props) {
    const {price} = props;
    return (
        <p className='cardTitle-price'>Price: <strong>{price} €</strong></p>)
}

export default ProductPrice;