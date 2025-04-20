class Success {
    constructor({
      data = null,
      error = null,
      status = 200,
      message = 'Success'
    }) {
      this.success = true;
      this.data = data;
      this.error = error;
      this.status = status;
      this.message = message;
    }
  
    toJSON() {
      return {
        success: this.success,
        data: this.data,
        error: this.error,
        status: this.status,
        message: this.message
      };
    }
  }

  export default Success