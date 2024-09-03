// Define the reportWebVitals function, which takes a callback function (onPerfEntry) as an argument
const reportWebVitals = onPerfEntry => {
  // Check if the onPerfEntry callback is provided and if it's a function
  if (onPerfEntry && onPerfEntry instanceof Function) {
    // Dynamically import the web-vitals library, which provides functions to measure web performance metrics
    import('web-vitals').then(({ 
      // Import the functions to measure specific web performance metrics:
      // CLS (Cumulative Layout Shift), FID (First Input Delay), FCP (First Contentful Paint), LCP (Largest Contentful Paint), and TTFB (Time To First Byte)
      getCLS, getFID, getFCP, getLCP, getTTFB 
    }) => {
      // Call each function to measure the corresponding web performance metric, and pass the result to the onPerfEntry callback
      getCLS(onPerfEntry);
      getFID(onPerfEntry);
      getFCP(onPerfEntry);
      getLCP(onPerfEntry);
      getTTFB(onPerfEntry);
    });
  }
};

// Export the reportWebVitals function as the default export
export default reportWebVitals;