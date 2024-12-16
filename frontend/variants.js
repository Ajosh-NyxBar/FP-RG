export const fade = (direction, delay) => {
    return {
      hidden: {
        opacity: 0,
        y: direction === "up" ? 80 : direction === "down" ? -80 : 0,
        x: direction === "left" ? 80 : direction === "right" ? -80 : 0,
        transition: {
          delay: delay,
          duration: 1.5,
          ease: [0.25, 0.6, 0.3, 0.8],
          type: "tween",
        },
      },
      show: {
        opacity: 1,
        y: 0,
        x: 0,
        transition: {
          type: "tween",
          delay: delay,
          duration: 0.8,
          ease: [0.25, 0.25, 0.25, 0.75],
        },
      },
    };
  };
  