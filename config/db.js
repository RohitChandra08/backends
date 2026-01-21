const mongoose=require("mongoose")

const connectdb=()=>{
    mongoose
    .connect("mongodb://127.0.0.1:27017/drivedb")
       
    .then(()=>{
        console.log("mongoose is ready")
    })

    .catch((err)=>{
        console.log(err.message)
    })
}

module.exports=connectdb