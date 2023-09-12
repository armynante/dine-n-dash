export const login = async (email:string,password:string) => {
  try {
    const response = await fetch("https://api.dine--dash.com/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({email, password})
    });

    console.log(response);
  
    const data = await response.json();

    console.log(data);

    if (!response.ok) {
      throw new Error(data.message || 'An error occurred while processing the login request');
    }
    
    // If there was an error, return an invalid response
    return JSON.stringify({ success: true, user: data });
  
  } catch (error) {
    console.error("error");
    console.error(error);
    const err = error as Error;
    return { error, message: err.message || 'An error occurred while processing the login request'  };
  }
}