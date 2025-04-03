import { useRef,useEffect } from "react";



const Video = () => {
  const vidRef=useRef();
  useEffect(() => { vidRef.current.play(); },[]);
  return (
    <video className="h-full w-full rounded-lg absolute -z-10 left-0 -top-10 blur-xs" loop muted autoPlay ref={vidRef}>
      <source src="https://cdn.pixabay.com/video/2024/03/15/204306-923909642_tiny.mp4" type="video/mp4" autoPlay/>
      Your browser does not support the video tag.
    </video>
    
  )
}

export default Video