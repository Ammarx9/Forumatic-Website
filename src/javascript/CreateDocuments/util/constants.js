/** 
 * @public
 * @typedef {Object} subInfo_Clo
 * @property {Number} num
 * @property {String} clo
 * @property {String} rd
 * @property {String} am
 * @property {String} tr
 * @property {String} al
 * @property {String} com
 */
/**
 * @public
 * @typedef {Object} subInfo_topics
 * @property {String} top
 * @property {String} res
 * @property {String} ex
 * @property {String} com
 */
/**
 * @public
 * @typedef {Object} subInfo_courseImprovments
 * @property {String} rec
 * @property {String} ac
 * @property {String} sup
 */
/**
 * @public
 * @typedef {Object} info_python_courseReportObj
 * @property {String} course_title
 * @property {String} course_code
 * @property {String} department
 * @property {String} program
 * @property {String} college
 * @property {String} institution
 * @property {Number} academic_year
 * @property {Number} semester
 * @property {String} course_instructor
 * @property {String} course_coordinator
 * @property {String} loc
 * @property {Number} section_num
 * @property {Number} students_str
 * @property {Number} students_coml
 * @property {String} report_date
 * @property {Number} ap
 * @property {Number} a
 * @property {Number} bp
 * @property {Number} b
 * @property {Number} cp
 * @property {Number} c
 * @property {Number} dp
 * @property {Number} d
 * @property {Number} f
 * @property {Number} dn
 * @property {Number} ip
 * @property {Number} ic
 * @property {Number} pass
 * @property {Number} fail
 * @property {Number} w
 * @property {Number} ap_pre
 * @property {Number} a_pre
 * @property {Number} bp_pre
 * @property {Number} b_pre
 * @property {Number} cp_pre
 * @property {Number} c_pre
 * @property {Number} dp_pre
 * @property {Number} d_pre
 * @property {Number} f_pre
 * @property {Number} dn_pre
 * @property {Number} ip_pre
 * @property {Number} ic_pre
 * @property {Number} pass_pre
 * @property {Number} fail_pre
 * @property {Number} w_pre
 * @property {String} Grades_comm
 * @property {Array.<subInfo_Clo>} clo_1
 * @property {Array.<subInfo_Clo>} clo_2
 * @property {Array.<subInfo_Clo>} clo_3
 * @property {String} Recommendations
 * @property {Array.<subInfo_topics>} topcs
 * @property {Array.<subInfo_courseImprovments>} course_imp
*/

/**
 * This JSON object has functions to retrieve innerHTML/value of elements
 * you supply it with depeneding on what element's node name you have.
 * 
 * supported nodes: p, textarea.
 */
export const getArbitraryElementValue = {
    /**
     * This function will take a paragraph element
     * and returns it's innerHTML text.
     * @param {HTMLParagraphElement} p_element 
     * @returns {Stirng}
     */
    P: function paragraphValue(p_element){
        return p_element.innerHTML
    },
    /**
     * This function will take a textArea element
     * and returns it's value (input text).
     * @param {HTMLTextAreaElement} p_element 
     * @returns {String}
     */
    TEXTAREA: function textareaValue(p_element){
        return p_element.value
    }
}

export const loaderHTML = (name) => {
    const mainDiv = document.createElement('div')
    if(name) mainDiv.className = 'three-body' + name
    else mainDiv.className = 'three-body'
    mainDiv.id = 'loader'

    const subDiv = document.createElement('div')
    subDiv.className = 'three-body__dot'

    mainDiv.appendChild(subDiv.cloneNode())
    mainDiv.appendChild(subDiv.cloneNode())
    mainDiv.appendChild(subDiv.cloneNode())
    mainDiv.appendChild(subDiv)
    return mainDiv
}
