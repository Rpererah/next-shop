import { stripe } from "@/src/lib/stripe"
import { ImageContainer, ProductContainer, ProductDetails } from "@/src/styles/pages/product"
import { GetStaticPaths, GetStaticProps } from "next"
import Image from "next/image"
import { useRouter } from "next/router"
import Stripe from "stripe"

interface ProductProps{
    product:{
        id:string;
        name:string;
        imageUrl:string;
        price:string;
        description:string
      }
}

export default function Product({product}:ProductProps){

    const {isFallback} = useRouter()
if(isFallback){
    return(
        <h1>loading!...</h1>
    )
}
    return(
        <ProductContainer>
        <ImageContainer>
            <Image src={product.imageUrl} alt="" height={480} width={520}/>
        </ImageContainer>
        <ProductDetails>
            <h1>{product.name}</h1>
            <span>{product.price}</span>
            <p>{product.description}</p>
            <button>
            Comprar agora
        </button>
        </ProductDetails>
        
        </ProductContainer>
    )
}

export const getStaticPaths:GetStaticPaths = async() =>{
    
    return {
        paths:[
            {params:{ id:'prod_QLRxwAGf7j7sKb'}}
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
              description:product.description
            },
        revalidate:60*60*1  //update each one hour
    }
}}