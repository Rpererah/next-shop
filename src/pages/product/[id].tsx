import { stripe } from "@/src/lib/stripe"
import { ImageContainer, ProductContainer, ProductDetails } from "@/src/styles/pages/product"
import axios from "axios"
import { GetStaticPaths, GetStaticProps } from "next"
import Head from "next/head"
import Image from "next/image"
import { useRouter } from "next/router"
import { useState } from "react"
import Stripe from "stripe"

interface ProductProps{
    product:{
        id:string;
        name:string;
        imageUrl:string;
        price:string;
        description:string
        defaultPriceId:string
      }
}

export default function Product({product}:ProductProps){
    const [isCreatingCheckoutSession,setIsCreatingCheckoutSession] = useState(false)

    const {isFallback} = useRouter()
if(isFallback){
    return(
        <h1>loading!...</h1>
    )
}
async function handleBuyProduct(){
    try {
        setIsCreatingCheckoutSession(true)
        const response=await axios.post('/api/checkout',{
            priceId:product.defaultPriceId
        })

        const {checkoutUrl} = response.data
        window.location.href=checkoutUrl
    } catch (error) {
        setIsCreatingCheckoutSession(false)
        //conect with a observable tools like DataDog or Sentry
        alert('Falha ao redirecionar ao checkout')
    }
}
    return(
        <>
        <Head>
            <title>Ignite Shop - Product {product.name}</title>  
        </Head>
        <ProductContainer>
        <ImageContainer>
            <Image src={product.imageUrl} alt="" height={480} width={520}/>
        </ImageContainer>
        <ProductDetails>
            <h1>{product.name}</h1>
            <span>{product.price}</span>
            <p>{product.description}</p>
            <button disabled={isCreatingCheckoutSession} onClick={handleBuyProduct}>
            Comprar agora
        </button>
        </ProductDetails>
        
        </ProductContainer>
        </>
    )
}

export const getStaticPaths:GetStaticPaths = async() =>{
    
    return {
        paths:[
            {params:{id:'prod_QLRxwAGf7j7sKb'}}
        ],fallback:true, //have 3 choices , with true you can do loading pages,with false you need hard code alls params and with blocking the page stay freeze by all content up
    }
}

export const getStaticProps:GetStaticProps<any,{id:string}> = async ({params}) =>{

    

const productId=params!.id;

const product= await stripe.products.retrieve(productId,{
    expand:['default_price']
})
const price = product.default_price as Stripe.Price


    return{
        props:{
            product:{
              id:product.id,
              name:product.name,
              imageUrl:product.images[0],
              price:new Intl.NumberFormat('pt-BR',{
                style:'currency',
                currency:'BRL',
              }).format(price.unit_amount! / 100),
              description:product.description,
              defaultPriceId:price.id,

            },
        revalidate:60*60*1  //update each one hour
    }
}}