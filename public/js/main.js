class App extends React.Component {
    constructor(){
      super();
      this.state = {
        page: 1,
        limit: 20,
        sort: 'id',
        arr: [],
        idleArr: [],
        idlePage: 1,
        adsArr: [],
        lastPage: false,
        loading: true,
        idleLoading: false,
        loadingMore: false,
      }
      this.handleScroll  = this.handleScroll.bind(this);
      this.fetchMore = this.fetchMore.bind(this);
      this.changeSort = this.changeSort.bind(this);
      this.fetchNew = this.fetchNew.bind(this);
      this.idleLoad = this.idleLoad.bind(this);
      this.resetIdleTimer = this.resetIdleTimer.bind(this);
      this.tx = 0;
    }

    componentDidMount(){
        const {page, limit, sort} = this.state;
        this.resetIdleTimer();
        document.addEventListener('mousemove', this.resetIdleTimer);
        document.addEventListener('keypress', this.resetIdleTimer);
        window.addEventListener('scroll', this.handleScroll);

        let axrr = []
        for (let i=0; i<1000; ++i ) {
            axrr[i]=i;
        }

        const newArr = this.reArrange(axrr);
        const query = `/api/products?_page=${page}&_limit=${limit}&_sort=${sort}`;
        fetch(query)
            .then(function(response) {
               return response.json();
            })
            .then(function(myJson) {
               this.setState({ arr : myJson, loading: false, adsArr: newArr  });
            }.bind(this));

    }

    resetIdleTimer(){
        // idle time 60 secs
        clearTimeout(this.tx);
        this.tx = setTimeout(this.idleLoad(), 60000);
    }

    idleLoad(){
        //function called when browser is idle
        const {page, sort, limit, arr, idleArr, idleLoading, loadingMore, loading } = this.state;
        const xPage = page + 1;
        if(!idleLoading && !loadingMore && !loading){
        if(idleArr[idleArr.length - 1] === undefined){
            this.setState({ idleLoading: true })
            const query = `/api/products?_page=${xPage}&_limit=${limit}&_sort=${sort}`;
            fetch(query)
                .then(function(response) {
                   return response.json();
                })
                .then(function(arrObj) {     
                          this.setState({ idleArr : arrObj, idlePage: xPage, idleLoading: false  });
                }.bind(this));
        }
    }
        
    }

    reArrange(array) {
        // rearrange the generated  ascending unique number to achieve random value in array
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
        const dateString = (date.getMonth() + 1) + '/' + date.getDate() + '/' +  date.getFullYear();
        const seconds = Math.floor((new Date() - date) / 1000);

        let interval = Math.floor(seconds / 31536000);
        if (interval >= 1) {
          return dateString;
        }
        interval = Math.floor(seconds / 2592000);
        if (interval >= 1) {
            return dateString;
        }
        interval = Math.floor(seconds / 86400);
        if (interval >= 1) {
            if(interval > 7 ){
                return dateString
            }
          return interval + " days ago";
        }
        interval = Math.floor(seconds / 3600);
        if (interval >= 1) {
          return interval + " hours ago";
        }
        interval = Math.floor(seconds / 60);
        if (interval >= 1) {
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

        this.resetIdleTimer();

        if(currHeight >= scrollHeight ){
            if(!loadingMore && !lastPage){
                this.fetchMore();
            }
        }
    };

    fetchMore(){
        const {page, sort, limit, arr, idleArr, idlePage } = this.state;
        const xPage = page + 1;
        if(arr[arr.length -1] !== undefined){
        if(idleArr[idleArr.length - 1] !== undefined && idlePage === xPage ){
            this.setState({ arr : [...arr, ...idleArr ] , page: xPage, idleArr: [] });
        } else {
            this.setState({ loadingMore : true });
            const query = `/api/products?_page=${xPage}&_limit=${limit}&_sort=${sort}`;
            fetch(query)
                .then(function(response) {
                   return response.json();
                })
                .then(function(arrObj) {
                    if(arrObj[arrObj.length - 1] === undefined){
                          this.setState({ loadingMore: false , page: xPage, lastPage: true, idleArr: [] });
                    } else{
                          this.setState({ arr : [...arr, ...arrObj ] , loadingMore: false , page: xPage, idleArr: [], idlePage: xPage  });
                    }
    
    
                }.bind(this));
        }
    } 
    // To avoid loading more on initial loading
    }

    changeSort(evt){
        this.setState({ sort: evt.target.value, loading: true, page : 1, idlePage: 1, idleArr: [] }, this.fetchNew)
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
        document.removeEventListener('mousemove', this.resetIdleTimer);
        document.removeEventListener('keypress', this.resetIdleTimer);
    };

    render(){
        const {loading, loadingMore, lastPage, sort, idleArr } = this.state;

//        console.log(idleArr);
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