import Image from "next/image"
import { styled } from "../styles"
import { HomeContainer, Product } from "../styles/pages/home"
import {useKeenSlider} from 'keen-slider/react'
import 'keen-slider/keen-slider.min.css'

import camiseta1 from '../assets/camisa1.png'
import camiseta2 from '../assets/camisa2.png'
import camiseta3 from '../assets/camisa3.png'
import { stripe } from "../lib/stripe"
import { GetServerSideProps } from "next"
import Stripe from "stripe"

interface HomeProps{
  products:{
    id:string;
    name:string;
    imageUrl:string;
    price:number;
  }[]
}

export default function Home({products}:HomeProps){
  const [sliderRef] =useKeenSlider({
    slides:{
      perView:3.2,
      spacing:48
    }
  })
  return(
    <HomeContainer ref={sliderRef} className="keen-slider">
      {products.map((product)=>(
           <Product className="keen-slider__slide" key={product.id}>
        
           <Image src={product.imageUrl} width={520} height={480} alt=""/>
           <footer><strong>{product.name}</strong> <span>{product.price}</span></footer>
         </Product>
        ))}
     
    </HomeContainer>
  )
}

export const getServerSideProps:GetServerSideProps=async ()=>{
  const response=await stripe.products.list({
    expand:['data.default_price']
  })
  const products=response.data.map(product=>{
    const price = product.default_price as Stripe.Price
    return{
      id:product.id,
      name:product.name,
      imageUrl:product.images[0],
      price:price.unit_amount / 100

    }
  }
)
  console.log(response.data)
  return{
    props:{
      products
    }
  }
}