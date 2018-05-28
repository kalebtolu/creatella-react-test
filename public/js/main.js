class App extends React.Component {
    constructor(){
      super();
      this.state = {
        page: 1,
        limit: 20,
        sort: 'id',
        arr: [],
        adsArr: [],
        lastPage: false,
        loading: true,
        loadingMore: false,
      }
      this.handleScroll  = this.handleScroll.bind(this);
      this.fetchMore = this.fetchMore.bind(this);
      this.changeSort = this.changeSort.bind(this);
      this.fetchNew = this.fetchNew.bind(this);
    }

    componentDidMount(){
        const {page, limit, sort} = this.state;

        let axrr = []
        for (let i=0; i<1000; ++i ) {
            axrr[i]=i;
        }
        const newArr = this.reArrange(axrr);
        const query = `/api/products?_page=${page}&_limit=${limit}&_sort=${sort}`;
        window.addEventListener('scroll', this.handleScroll);
        fetch(query)
            .then(function(response) {
               return response.json();
            })
            .then(function(myJson) {
               this.setState({ arr : myJson, loading: false, adsArr: newArr  });
            }.bind(this));

    }

    reArrange(array) {
        let i = array.length,
            j = 0,
            temp;
    
        while (i--) {
            j = Math.floor(Math.random() * (i+1));
            temp = array[i];
            array[i] = array[j];
            array[j] = temp;
        }
        return array;
    }

    timeSince(datex) {
        const date = new Date(datex);
        const seconds = Math.floor((new Date() - date) / 1000);
        let interval = Math.floor(seconds / 31536000);
        if (interval > 1) {
          return interval + " years ago";
        }
        interval = Math.floor(seconds / 2592000);
        if (interval > 1) {
          return interval + " months ago";
        }
        interval = Math.floor(seconds / 86400);
        if (interval > 1) {
          return interval + " days ago";
        }
        interval = Math.floor(seconds / 3600);
        if (interval > 1) {
          return interval + " hours ago";
        }
        interval = Math.floor(seconds / 60);
        if (interval > 1) {
          return interval + " minutes ago";
        }
        return Math.floor(seconds) + " seconds ago";
      }
     
    handleScroll(event) {
        const { loadingMore, lastPage } = this.state;
        const scrollTop  = document.documentElement.scrollTop || document.body.scrollTop;
        const scrollHeight =  document.body.scrollHeight;
        const clientHeight = document.documentElement.clientHeight;
        const currHeight = scrollTop + clientHeight;

        if(currHeight >= scrollHeight ){
            if(!loadingMore && !lastPage){
                this.fetchMore();
            }
        }
    };

    fetchMore(){
        this.setState({ loadingMore : true });
        const {page, sort, limit, arr} = this.state;
        const xPage = page + 1;
        const query = `/api/products?_page=${xPage}&_limit=${limit}&_sort=${sort}`;
        fetch(query)
            .then(function(response) {
               return response.json();
            })
            .then(function(arrObj) {
                if(arrObj[arrObj.length - 1] === undefined){
                      this.setState({ loadingMore: false , page: xPage, lastPage: true });
                } else{
                      this.setState({ arr : [...arr, ...arrObj ] , loadingMore: false , page: xPage });
                }


            }.bind(this));
    }

    changeSort(evt){
        this.setState({ sort: evt.target.value, loading: true, page : 1 }, this.fetchNew)
    }

    fetchNew(){
        const {page, limit, sort} = this.state;

        let axrr = []
        for (let i=0; i<1000; ++i ) {
            axrr[i]=i;
        }
        const newArr = this.reArrange(axrr);
        const query = `/api/products?_page=${page}&_limit=${limit}&_sort=${sort}`;
        window.addEventListener('scroll', this.handleScroll);
        fetch(query)
            .then(function(response) {
               return response.json();
            })
            .then(function(myJson) {
               this.setState({ arr : myJson, loading: false, adsArr: newArr  });
            }.bind(this));
    }


    renderStateView(){
        const { arr, adsArr, page } = this.state;
        const renderedView = arr.map((item, index) => {
        const { id, date, face, price, size } = item;
        const avgCount = (index+1) / 20; 
        const fontSize = `${size}px`; 
        console.log(fontSize);

         if( (avgCount % 1) === 0 ){
            return [
                    <div className="grid">
                    <div className="face" style={{ fontSize }}>
                        {face}
                    </div>
                    <div className="others">
                        <div className="size">size {size}</div>
                        <div className="price">${price/100}</div>
                        <div className="time">{this.timeSince(date)}</div>
                    </div>
                    </div>,
                    <div className="ads">
                       <img className="ad" src={`/ads/?r=${adsArr[avgCount]}`} /> 
                    </div>
                    ]
        } 
        return ( 
                <div className="grid">
                    <div className="face" style={{ fontSize }}>
                        {face}
                    </div>
                    <div className="others">
                        <div className="size">size {size}</div>
                        <div className="price">${price/100}</div>
                        <div className="time">{this.timeSince(date)}</div>
                    </div>
                </div>
        );
    
    
        })
        return renderedView
    }

    componentWillUnmount() {
        window.removeEventListener('scroll', this.handleScroll);
    };

    render(){
        const {loading, loadingMore, lastPage, sort } = this.state;
        console.log(sort);
        if(loading){
            return (
                <div className="spinner">
                    <img src="./imgs/loading_spinner.gif" />
                </div>
            )
        }
        return (


            <div className="products">
            <div className="sortsView">
                <div className="sortsPane">
                    Sort By <select
                                onChange={this.changeSort} 
                                value={sort}
                            >
                                <option value="id">id</option>
                                <option value="size">size</option>
                                <option value="price">price</option>
                            </select>
                </div>
            </div>

            <div className="mainProducts">
                {this.renderStateView()}
                {
                    loadingMore ? (
                        <div className="spinner">
                            <img src="./imgs/loading_spinner.gif" />
                        </div>  
                    ) :  null
                }
                {
                    lastPage ? (
                        <div className="spinner">
                            ~ end of catalogue ~
                        </div>  
                    ) : null
                }
            </div>
            </div>
        )
    }
}

ReactDOM.render(
    <App />,
    document.getElementById('products')
  );