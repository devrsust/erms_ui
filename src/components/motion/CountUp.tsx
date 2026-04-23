import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { useEffect } from "react";

export default function CountUp({ value }: { value: number }) {
    const motionValue = useMotionValue(0);
    const springValue = useSpring(motionValue, {
        stiffness: 5, 
        damping: 25,  
        mass: 1,      
    });

    const display = useTransform(springValue, (latest) =>
        Math.floor(latest)
    );

    useEffect(() => {
        motionValue.set(value);
    }, [value, motionValue]);

    return <motion.span>{display}</motion.span>;
}