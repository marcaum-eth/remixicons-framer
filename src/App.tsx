import { Suspense, useCallback, useDeferredValue, useMemo, useState, Context } from "react"
import "./App.css"
import { framer, Draggable } from "framer-plugin"
import Fuse from "fuse.js"
import * as remixIcons from "@remixicon/react"
import type { RemixiconComponentType as RemixIcon } from "@remixicon/react"
import tags from "./tags.json"
import { renderToStaticMarkup } from "react-dom/server"

declare const IconContext: Context<{
    color?: string
    size?: number | string
    children?: never
}>

interface IconInterface {
    name: string
    svg: (props: { color?: string; size?: number | string; children?: never }) => React.ReactNode
}

type WeightOption = { key: string; value: string }

function convertToPascalCase(name: string): string {
    return name
        .split("-")
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join("")
}
const capitalize = (s: string) => (s && String(s[0]).toUpperCase() + String(s).slice(1)) || ""
const weightOptions: WeightOption[] = [
    {
        key: "Line",
        value: "line",
    },
    {
        key: "Fill",
        value: "fill",
    },
]

const fuseOptions = {
    keys: ["tags"],
    threshold: 0.3,
}

const icons: IconInterface[] = Object.keys(remixIcons).map(key => ({
    name: key,
    svg: (remixIcons as any)[key],
}))

function searchIcons(query: string, tags: any) {
    const lowerCaseQuery = query.trim().toLowerCase();
    if (!lowerCaseQuery) {
        return Object.entries(tags)
            .flatMap(([category, icons]) =>
                Object.entries(icons as { [key: string]: string }).map(([name, tags]) => ({
                    category,
                    name,
                    tags: tags.split(","),
                }))
            );
    }

    const queryWords = lowerCaseQuery.split(" ");
    return Object.entries(tags)
        .flatMap(([category, icons]) =>
            Object.entries(icons as { [key: string]: string })
                .filter(([name, tags]) =>
                    queryWords.every(word =>
                        name.toLowerCase().includes(word) ||
                        tags.split(",").some(tag => tag.trim().toLowerCase().includes(word)) ||
                        category.toLowerCase().includes(word)
                    )
                )
                .map(([name, tags]) => ({
                    category,
                    name,
                    tags: tags.split(","),
                }))
        );
}

function IconGrid(props: any) {
    const { searchQuery, weight } = props;
    const iconMap = props.iconMap;
    const deferredQuery = useDeferredValue(searchQuery);

    const filteredIcons = useMemo(() => {
        return searchIcons(deferredQuery, tags);
    }, [deferredQuery]);

    // const filteredIcons = props.filteredIcons

    const handleIconClick = useCallback(
        async (entry: IconInterface) => {
            const { svg: Icon } = entry

            const svg = renderToStaticMarkup(<Icon color={"black"} size={32} />)

            await framer.addSVG({
                svg,
                name: "Icon",
            })
        },
        [weight]
    )

    if (filteredIcons.length === 0) {
        return (
            <div className="error-container">
                <p>No Results</p>
            </div>
        )
    }

    return (
        <div className="grid">

            {filteredIcons.map((entry: any) => {
                const { name } = entry

              
                const Element = iconMap.get(`Ri${convertToPascalCase(name)}${capitalize(weight)}`)
                if (!Element) return null

                return (
                    <Draggable
                        data={() => ({
                            type: "svg",
                            name: "Icon",
                            svg: renderToStaticMarkup(<Element color="currentColor" />),
                        })}
                        key={entry.name}
                    >
                        <button className="icon-parent" onClick={() => handleIconClick(Element)}>
                            <Element color="currentColor" />
                        </button>
                    </Draggable>
                )
            })}
        </div>
    )
}

export function App() {
    const [weight, setWeight] = useState<string>("line")
    const [searchQuery, setSearchQuery] = useState("")


    const filteredIcons = useMemo(() => {
        if (!searchQuery) {
            return Object.entries(tags).flatMap(([category, icons]) =>
                Object.entries(icons).map(([name, tags]) => {
                    return { category, name, tags: tags.split(",") }
                })
            )
        }
        return searchIcons(searchQuery, tags)
    }, [searchQuery])
    const iconMap = useMemo(() => {
        const map = new Map<string, any>()
        Object.keys(remixIcons).forEach(iconName => {
            map.set(iconName, (remixIcons as any)[iconName])
        })
        return map
    }, [])
    return (
        <>
            <div className="search-container">
                <input
                    autoComplete="nope"
                    autoCorrect="off"
                    autoFocus
                    className="search-input"
                    onChange={e => setSearchQuery(e.target.value)}
                    placeholder="Search…"
                />
                <select
                    className="weight-selector"
                    value={weight}
                    onChange={e => {
                        setWeight(e.target.value)
                    }}
                >
                    {weightOptions.map(option => (
                        <option key={option.key} value={option.value}>
                            {option.key}
                        </option>
                    ))}
                </select>
            </div>

            <div className="grid-container">
                <Suspense fallback={null}>
                    <IconGrid iconMap={iconMap} filteredIcons={filteredIcons} searchQuery={searchQuery} weight={weight} />
                </Suspense>
            </div>

            
        </>
    )
}
