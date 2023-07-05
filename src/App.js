import React, { useEffect, useRef, useState } from 'react';
import { Collapse, Input, Spin, message } from 'antd'
import InfiniteScroll from 'react-infinite-scroll-component';
import './App.css';

function App() {
  const isFirstLoad = useRef(true)
  const [cats, setCats] = useState([])
  const [allCats, setAllCats] = useState([])
  const [isLoading, setLoading] = useState(true)
  const [isSearchLoading, setSearchLoading] = useState(true)
  const [hasMore, setHasMore] = useState(true)
  const [isFetchAllCats, setFetchAllCats] = useState(false)
  const [pagination, setPagination] = useState({
    limit: 10,
    page: 0,
  })
  const fetchCats = async () => {
    if (pagination.page === 0) setLoading(true)
    try {
      const response = await fetch(`https://api.thecatapi.com/v1/breeds?limit=${pagination.limit}&page=${pagination.page}`)
      response.json().then(res => {
        if (res.length > 0 && res.length < pagination.limit) {
          setCats(curr => [...curr, ...res])
          setHasMore(false)
        } else if (res.length > 0) {
          setCats(curr => [...curr, ...res])
          setPagination(curr => ({ limit: curr.limit, page: curr.page + 1 }))
        } else {
          setHasMore(false)
        }
      }).catch(err => {
        message.error(err.message)
      })
      setLoading(false)
    } catch (err) {
      message.error(err.message)
    }
  }

  const fetchAllCats = async () => {
    setSearchLoading(true)
    try {
      const response = await fetch(`https://api.thecatapi.com/v1/breeds`)
      response.json().then(res => {
        setAllCats(res)
      }).catch(err => {
        message.error(err.message)
      })
      setSearchLoading(false)
      setFetchAllCats(true)
    } catch (err) {
      message.error(err.message)
    }
  }

  const onSearch = (val) => {
    if (val) {
      setCats([])
      setHasMore(false)
      setCats(allCats.filter(cat => {
        const catName = cat.name ? cat.name.toLowerCase() : ""
        const catAltNames = cat.alt_names ? cat.alt_names.toLowerCase() : ""
        return catName.includes(val.toLowerCase()) || catAltNames.includes(val.toLowerCase())
      }))
    } else {
      setCats([])
      setHasMore(true)
      setPagination(curr => {
        return {
          limit: curr.limit,
          page: 0,
        }
      },)
    }
  }

  const onExpand = async (ids) => {
    const trueId = ids[0]
    try {
      const response = await fetch(`https://api.thecatapi.com/v1/breeds`)
      response.json().then(res => {
        setAllCats(res)
      }).catch(err => {
        message.error(err.message)
      })
      setSearchLoading(false)
      setFetchAllCats(true)
    } catch (err) {
      message.error(err.message)
    }
  }

  useEffect(() => {
    if (isFirstLoad.current) isFirstLoad.current = false
    else {
      if (pagination.page === 0) fetchCats()
      if (!isFetchAllCats) fetchAllCats()
    }
  }, [pagination])

  return (
    <div className="App">
      <Spin spinning={isLoading}>
        <div className="h-wrapper">
          <h1>🐈 Cat Breeds 🐈‍⬛</h1>
          <Input.Search
            placeholder="Search..."
            onSearch={onSearch}
            loading={isSearchLoading}
          />
        </div>
        <div id="scrollable-panel" className="cards-wrapper">
          <InfiniteScroll
            dataLength={cats.length}
            next={fetchCats}
            hasMore={hasMore}
            loader={<h4>Loading...</h4>}
            endMessage={
              <p style={{ textAlign: 'center' }}>
                <b>Yay! You have seen it all</b>
              </p>
            }
            scrollableTarget="scrollable-panel"
          >
            {cats.map((cat, i) => (
              <div className='card' key={`card-${cat.id}`}>
                <Collapse
                  items={[{
                    key: cat.id,
                    label: cat.name,
                    children: <div>
                      <img src={`https://cdn2.thecatapi.com/images/${cat.reference_image_id}.jpg`} alt="" width="100%" style={{ maxWidth: "400px" }} />
                      <br />
                      <img src={`https://cdn2.thecatapi.com/images/${cat.reference_image_id}.png`} alt="" width="100%" style={{ maxWidth: "400px" }} />
                      {cat.alt_names && <p>Other names: {cat.alt_names}</p>}
                      <p>{cat.description}</p>
                      <i>
                        Read more: <a href={cat.wikipedia_url} target='_blank'>
                          {cat.wikipedia_url}
                        </a>
                      </i>
                    </div>
                  }]}
                  onChange={onExpand}
                />
              </div>
            ))}
            {/* {cats.length === 0 && <div>

            </div>} */}
          </InfiniteScroll>
        </div>
      </Spin>
    </div>
  );
}

export default App;
