import React from 'react';


function ProductPrice(props) {
    const {price} = props;
    return (
        <div className='cardTitle-price'>Price: <strong>{price} €</strong></div>)
}

export default ProductPrice;