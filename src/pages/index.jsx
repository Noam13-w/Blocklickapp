import Layout from "./Layout.jsx";

import AdminAnalytics from "./AdminAnalytics";

import AdminCoupons from "./AdminCoupons";

import AdminOrders from "./AdminOrders";

import Blocks from "./Blocks";

import Cart from "./Cart";

import Collage from "./Collage";

import Home from "./Home";

import Magnets from "./Magnets";

import Photos from "./Photos";

import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';

const PAGES = {
    
    AdminAnalytics: AdminAnalytics,
    
    AdminCoupons: AdminCoupons,
    
    AdminOrders: AdminOrders,
    
    Blocks: Blocks,
    
    Cart: Cart,
    
    Collage: Collage,
    
    Home: Home,
    
    Magnets: Magnets,
    
    Photos: Photos,
    
}

function _getCurrentPage(url) {
    if (url.endsWith('/')) {
        url = url.slice(0, -1);
    }
    let urlLastPart = url.split('/').pop();
    if (urlLastPart.includes('?')) {
        urlLastPart = urlLastPart.split('?')[0];
    }

    const pageName = Object.keys(PAGES).find(page => page.toLowerCase() === urlLastPart.toLowerCase());
    return pageName || Object.keys(PAGES)[0];
}

// Create a wrapper component that uses useLocation inside the Router context
function PagesContent() {
    const location = useLocation();
    const currentPage = _getCurrentPage(location.pathname);
    
    return (
        <Layout currentPageName={currentPage}>
            <Routes>            
                
                    <Route path="/" element={<AdminAnalytics />} />
                
                
                <Route path="/AdminAnalytics" element={<AdminAnalytics />} />
                
                <Route path="/AdminCoupons" element={<AdminCoupons />} />
                
                <Route path="/AdminOrders" element={<AdminOrders />} />
                
                <Route path="/Blocks" element={<Blocks />} />
                
                <Route path="/Cart" element={<Cart />} />
                
                <Route path="/Collage" element={<Collage />} />
                
                <Route path="/Home" element={<Home />} />
                
                <Route path="/Magnets" element={<Magnets />} />
                
                <Route path="/Photos" element={<Photos />} />
                
            </Routes>
        </Layout>
    );
}

export default function Pages() {
    return (
        <Router>
            <PagesContent />
        </Router>
    );
}