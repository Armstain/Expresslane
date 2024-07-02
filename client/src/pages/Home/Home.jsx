import React from 'react';
import Banner from './Banner/Banner.jsx';
import Features from './Features/Features.jsx';
import TopDeliveryMen from './TopDeliveryMen/TopDeliveryMen.jsx';

const Home = () => {
    return (
        <div className='container'>
            <Banner></Banner>
            <Features></Features>
            <TopDeliveryMen></TopDeliveryMen>
        </div>
    );
};

export default Home;