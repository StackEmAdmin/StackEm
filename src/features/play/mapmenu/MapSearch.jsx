import { useEffect, useRef } from 'react';
import { Form, useLoaderData, useNavigation } from 'react-router-dom';
import c from '../../../util/constants';
import str from '../../../util/str';
import randomWait from './randomWait';
import SearchSVG from '../../../assets/img/SearchSVG';
import FilterSVG from '../../../assets/img/FilterSVG';
import './MapSearch.css';

async function loader({ request }) {
  const url = new URL(request.url);
  const q = url.searchParams.get('q');

  let type;
  try {
    type = url.searchParams.get('type')
      ? url.searchParams.get('type').toLowerCase()
      : 'all';
    if (type !== 'all' && !c.MAP_TYPES.includes(type)) {
      throw new Error(`${type} is not a valid map type`);
    }
  } catch (e) {
    console.error(e);
    type = 'all';
  }

  if (!q) {
    return { query: '', q: '', type: 'all' };
  }
  await randomWait();
  return { query: `query=${q}`, q, type };
}

function MapSearch() {
  const inputRef = useRef(null);
  const { query, q, type } = useLoaderData();
  const navigation = useNavigation();

  const searching =
    navigation.location &&
    new URLSearchParams(navigation.location.search).has('q');

  console.log(query, q, type);

  useEffect(() => {
    // user controls input and handled in loader (no need for ref)
    document.getElementById('map-search-input').value = q;
    document.getElementById('map-search-select').value = type;
  }, [q]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === '/') {
        event.preventDefault();
        inputRef.current.focus();
      }
      if (event.key === 'Escape') {
        inputRef.current.blur();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  return (
    <Form
      id="map-search-form"
      className={searching ? 'loading' : ''}
      role="search"
      onSubmit={(ev) => {
        // If input is empty, don't submit form
        if (ev.target.elements['q'].value === '') {
          ev.preventDefault();
          inputRef.current.blur();
        }
      }}
    >
      <label
        id="map-search-label"
        htmlFor="map-search-input"
        className="--global-hover-focus-active-border"
      >
        <div className="icon-container">
          <SearchSVG />
        </div>
        <input
          ref={inputRef}
          id="map-search-input"
          aria-label="Search maps"
          placeholder="Search"
          type="search"
          name="q"
          defaultValue={q}
          maxLength={c.MAP_MAX_TITLE_LENGTH}
        />
        <button className="key-shortcut --global-hover-focus-active-border"></button>
      </label>
      <select
        name="type"
        id="map-search-select"
        className="--global-hover-focus-active-border"
      >
        <option value="all">All</option>
        {c.MAP_TYPES.map((type) => (
          <option key={type} value={type}>
            {str.capitalize(type)}
          </option>
        ))}
      </select>
      <button
        type="button"
        className="filter --global-hover-focus-active-border"
      >
        <FilterSVG />
      </button>
    </Form>
  );
}

export { MapSearch as default, loader };
