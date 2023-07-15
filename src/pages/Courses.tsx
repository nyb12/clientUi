import { useCallback, useEffect, useMemo, useState } from "react";
import { map, forEach } from "lodash";
import Loader from "../components/Loader";
import CourseCard from "../components/CourseCard";
import Filters from "../components/Filters";
import { useDispatch, useSelector } from "react-redux";
import { coursesSelector, setCourses } from "../store/slices/coursesSlice";
import NoCourseAvailable from "../components/NoCourseAvailable";
import { Row, Col, Container } from "react-bootstrap";
import { HiAdjustmentsHorizontal } from "react-icons/hi2";
import NewHeader from "../components/NewHeader";
//@ts-ignore
import CourseShimmer from "../components/CourseShimmer";
const Courses = (props: any) => {
  const { socket, mode } = props;

  const [connected, setIsConnected] = useState<boolean>(false);
  const [data, setData] = useState<any>();
  const [showData, setShowData] = useState(false);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({});
  const [searchText, setSearchText] = useState("");

  const dispatch = useDispatch();
  const courses = useSelector(coursesSelector);
  console.log("bbb:", { courses });

  useEffect(() => {
    socket.on("connect", () => {
      console.log("socket connected");
      setIsConnected(true);
    });

    socket.on("disconnect", () => {
      setIsConnected(false);
    });

    socket.on("response", (payload: any) => {
      console.log("ccc payload in response: ", payload);
      dispatch(setCourses(payload.message));
      setShowData(true);
      setLoading(false);
    });

    return () => {
      socket.off("connect");
      socket.off("disconnect");
      socket.off("response");
      setShowData(false);
    };
  }, [dispatch]);

  const handleChange = (ev: any) => {
    setSearchText(ev.target.value);
    socket.emit("search", {
      query: ev.target.value,
    });
    setLoading(true);
  };

  useEffect(() => {
    socket.emit("search", {
      query: "",
      ...filters,
    });
    setLoading(true);
  }, [filters]);

  console.log("mnop:", { courses });
  const dataToDisplay = useMemo(() => {
    const dtp: Array<any> = [];
    forEach(courses?.["providers"], (categories: any, index: number) => {
      if (index < 5)
        forEach(categories?.items, (category: any, index: number) => {
          if (index < 5) dtp.push(category);
        });
    });
    return dtp;
  }, [courses]);

  const isDataAvailable = useMemo(
    () => showData || dataToDisplay?.length > 0,
    [showData, dataToDisplay]
  );

  // if (!isDataAvailable) return <Loader />;
  return (
    <>
      <NewHeader handleChange={handleChange} isSearchVisible />
      <Row style={{ background: "#f3f3f8" }}>
        {searchText && (
          <div
            className={` text-4xl font-medium min-w-[1100px] mx-auto py-4 px-3 my-3 bg-white`}
            // className={`${
            //   mode === "dark" ? "text-white" : ""
            // } text-4xl font-medium min-w-[1100px] mx-auto py-4 px-3 my-3 bg-white`}
          >
            <span style={{ color: "grey" }}> Search results for </span> &nbsp;
            <span className="font-bold">"{searchText}"</span>
          </div>
        )}
      </Row>
      <div
        style={{ backgroundColor: "#f7f7f7", minHeight: "90vh" }}
        className="p-3"
      >
        <Row>
          <Col xs={3}>
            <Filters applyFilter={setFilters} mode={mode} />
          </Col>

          {/* {isDataAvailable && ( */}
          {true && (
            <Col xs={9}>
              <Row>
                {!loading && (
                  <div
                    className={`
                  font-medium mb-3`}
                  >
                    Showing &nbsp;
                    <span className="font-bold">
                      {dataToDisplay?.length} courses
                    </span>
                  </div>
                )}
              </Row>
              <Row>
                {dataToDisplay.length === 0 && !loading && (
                  <NoCourseAvailable />
                )}

                {loading ? (
                  <>
                    <CourseShimmer />
                  </>
                ) : dataToDisplay.length > 0 ? (
                  <Row>
                    {map(dataToDisplay, (course: any) => (
                      <CourseCard course={course} />
                    ))}{" "}
                  </Row>
                ) : null}
              </Row>
            </Col>
          )}
        </Row>
      </div>
    </>
  );
};

export default Courses;
