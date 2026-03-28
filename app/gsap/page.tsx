
'use client'

import React, { useRef } from 'react'
import { gsap } from 'gsap'
import { useGSAP } from '@gsap/react'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { ScrollToPlugin } from 'gsap/ScrollToPlugin'

gsap.registerPlugin(ScrollTrigger, ScrollToPlugin)

const SmoothScrollGsap: React.FC = () => {
    const container = useRef<HTMLDivElement>(null)

    const { contextSafe } = useGSAP({ scope: container }) // we can pass in a config object as the 1st parameter to make scoping simple

    // ✅ wrapped in contextSafe() - animation will be cleaned up correctly
    // selector text is scoped properly to the container.
    const onClickGood = contextSafe(() => {
        gsap.to('.good', { rotation: 180 })
    })

    return (
        <div ref={container}>
            <button onClick={onClickGood} className="good"></button>
        </div>
    )
}

export default SmoothScrollGsap
