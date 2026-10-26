import React, { useContext } from 'react'
import Hero from '../Components/Hero/Hero'
import Popular from '../Components/Popular/Popular'
import Offers from '../Components/Offers/Offers'
import NewCollections from '../Components/NewCollections/NewCollections'
import NewsLetter from '../Components/NewsLetter/NewsLetter'
import { ShopContext } from '../Context/ShopContext'

const Shop = () => {
  const { refreshKey } = useContext(ShopContext);

  return (
    <div key={refreshKey} className="shop-page" data-testid="shop-page" data-refresh-key={refreshKey}>
      <Hero />
      <Popular key={`popular-${refreshKey}`} />
      <Offers />
      <NewCollections key={`newcollections-${refreshKey}`} />
      <NewsLetter />
    </div>
  )
}

export default Shop