export const emailFormatValidation = () => {
    const curEmail = document.getElementsByName('email')[0].value;
    const emailFormat = /([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9._-]+)/;
    const checkFormat = emailFormat.test(curEmail);

    if(checkFormat) {
        return true;
    }
    return false;
}

export const emailUniquenessValidation = (users) => {
    const curEmail = document.getElementsByName('email')[0].value;
    const checkEmail = users.findIndex(user => curEmail === user.email);

    return checkEmail === -1;
}

export const passwordFormatValidation = (password) => {
    const checkFormat = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/;
    //Password must contain at least 8 characters, at least one letter, one number and one special character.

    return checkFormat.test(password);
}

export const validateUniqueUsername = (users, curUsername) => {
    const checkUniqueness = users.findIndex(user => user.username === curUsername);

    return checkUniqueness === -1;
}

export const validateUsernameFormat = (curUsername) => {
    const checkFormat = /^([a-zA-Z0-9._-]+){5,16}$/;
    //Username must contain between 5 and 16 characters, and cannot include special characters.

    return checkFormat.test(curUsername);
}