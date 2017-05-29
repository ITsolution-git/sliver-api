class CustomDate {

    /**
     *Calculates the end date of the plan
     *
     * @param {Date} startDate
     * @param {Number} executeMonth
     * @return {Date} expirationDate
     * */
    static expirationDate(startDate,executeMonth) {
        let expirationDate = startDate;
        let expirationMonth = startDate.getMonth() + executeMonth;

        if(expirationMonth <= 11) {
            expirationDate.setMonth(expirationMonth);
        } else {
            let year = startDate.getFullYear() + Math.floor(expirationMonth / 11);
            let month = expirationMonth % 11 - 1;
            
            expirationDate.setFullYear(year, month);
        }

        return expirationDate;
    }

    /**
     * Calculates the next date of the payment
     *
     * @param {Date} paymentDate
     * @return {Date} nextPayment
     * */
    static nextPaymentDay(paymentDate) {
        let month = paymentDate.getMonth();
        if(month !== 11) {
            return paymentDate.setMonth(month + 1);
        } else {
            return paymentDate.setFullYear(paymentDate.getFullYear() + 1, 0);
        }
    }

}

module.exports = CustomDate;