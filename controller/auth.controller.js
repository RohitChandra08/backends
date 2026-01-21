const Admin=require("../model/auth.model")

const signupAdmin=async (req,res)=>{
  try {
      const {name,email,password}=req.body
      if(!name || !email || !password){
        return res.status(400).json({success:false,message:"All fields are required"})
      }

      const isExist=await Admin.findone({email})
      if(isExist){
        res.status(409).json({success:false,message:"Email has already exist"})
      }

      const Admin=await Admin.create({
        name,
        email,
        password
      })

      res.status(201).json({success:true,message:"User signup successfully"})
      

  } catch (error) {
    res.status(500)
    .json({
        success:false,
        message:"internal server error",
        message:error.message
    })
  }
}

const loginAdmin=async (req,res)=>{
   try {
      const {email,password}=req.body
       if(!email || !password){
        return res.status(400).json({success:false,message:"all fields are required"})
       }
       
       const isExist=await Admin.findone({email})
       if(isExist){
        res.status(404).json({success:false,message:"Email and password is wrong"})
       }

       res.status(200).json({success:true,message:"User login successfully"})

   } catch (error) {
    res.status(500)
    .json({
        success:false,
        message:"internal server error",
        message:error.message
    })
   }
}

const logoutAdmin=async (req,res)=>{
   try {
    res.status(200).json({ success:true, message: "Admin logout successfully" });
  } catch (error) {
    response.status(500)
    .json({
        success:false,
        message:"internal server error",
        error:error.message
    })
  }
}

module.exports={signupAdmin,loginAdmin,logoutAdmin}