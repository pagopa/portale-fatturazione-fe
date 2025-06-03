
import Loader from "../../components/reusableComponents/loader";

const LoadingRoute = () => {

    return (
        <div className="d-flex justify-content-center align-items-center" style={{height: '100vh'}}>
            <div id='loader_on_gate_pages'>
                <Loader sentence={'Richiesta dati in corso...'}></Loader> 
            </div>
        </div>
       
    );
};

export default LoadingRoute;