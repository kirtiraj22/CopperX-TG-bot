export const getUserBalance = async () => {
    try{
        return "10";
    }catch(error){
        console.error("Error fetching balance", error);
        throw new Error("Unable fetch balance");
    }
}