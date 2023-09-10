export const login = async (email:string,password:string) => {
  try {
    const response = await fetch("http://localhost:4000/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({email, password})
    });
  
    const data = await response.json();

    console.log(data);

    if (!response.ok) {
      throw new Error(data.message || 'An error occurred while processing the login request');
    }
    
    // If there was an error, return an invalid response
    return { success: true, user: data.user };
  
  } catch (error) {
    console.error("error");
    console.error(error);
    const err = error as Error;
    return { error, message: err.message || 'An error occurred while processing the login request'  };
  }
}