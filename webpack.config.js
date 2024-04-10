const path = require('path')
const srcPath = './src/javascript/'


// export obj from this file and it is configrtion
module.exports = {
    // here is the mode of this file but no need to chnge
  mode: 'development',
//   here the entry you give where to look for your javascript file 
entry: {
  login : srcPath + 'login.js',
  register: srcPath + 'register.js',
  courseSpecification: srcPath + 'courseSpecification/courseSpecification.js',
  saved_rep: srcPath + 'saved_rep.js',
  savedSpecifications: srcPath + 'savedSpecifications.js',
  courseReport : srcPath + 'courseReport/courseReport.js',
  createInstitution: srcPath + 'CreateDocuments/institution.js',
  createCollege: srcPath + 'CreateDocuments/college.js',
  createDepartment: srcPath + 'CreateDocuments/department.js',
  createCourse: srcPath + 'CreateDocuments/course.js',
  createSection: srcPath + 'CreateDocuments/section.js',
  createCLO: srcPath + 'CreateDocuments/CLO.js',
  index: srcPath + 'index/index.js'
},
  output: {
    // here we chose where our file put it 
    // the (__dirname) is from this file start from it loction to look where to put the file
    path: path.resolve(__dirname, 'public/javascript'),
    //  what the output file name
    filename: '[name].bundle.js', // Use [name] to include the entry point name in the output filename
  
  },
//   this line evry time we make chnage in j.js file will put in bundle.js file
  watch: true
}
