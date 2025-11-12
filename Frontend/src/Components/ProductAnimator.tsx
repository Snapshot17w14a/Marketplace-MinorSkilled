import { useEffect, useRef, useState } from 'react';
import Products from '../assets/products.json'

export default function ProductAnimator({ interval, className } : { interval: number, className: string }) {
    
    const [product, setProduct] = useState<string>(Products[0]);
    const [width, setWidth] = useState(0);
    
    const lastTimeRef = useRef<number>(performance.now());
    const requestRef = useRef(0);
    const spanRef = useRef<HTMLSpanElement | null>(null);

    useEffect(() => {
        if (spanRef.current !== null) {
            setWidth(spanRef.current.offsetWidth)
        }
    }, [product])

    useEffect(() => {
        const animate = (currentTime: number) => {
            const deltaTime = currentTime - lastTimeRef.current;

            if (deltaTime >= interval) {
                setProduct(Products[Math.floor(Math.random() * Products.length)])
                lastTimeRef.current = currentTime;
            }

            requestRef.current = requestAnimationFrame(animate);
        };

        requestRef.current = requestAnimationFrame(animate);
        return () => cancelAnimationFrame(requestRef.current);
    }, []);
    
    return(
        <div className={'flex justify-center items-center transition-(--transition-width) durarion-500 ease-in-out overflow-hidden mx-2'} style={{ width: width }}>
            <span key={product} ref={spanRef} className={className + 'animate-opacity transition-all duration-500 ease-in-out'}>
                <p className='text-nowrap'>{product}</p>
            </span>
        </div>
    )
}