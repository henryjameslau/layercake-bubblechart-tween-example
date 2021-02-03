
(function(l, r) { if (l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (window.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(window.document);
var app = (function () {
    'use strict';

    function noop() { }
    const identity = x => x;
    function assign(tar, src) {
        // @ts-ignore
        for (const k in src)
            tar[k] = src[k];
        return tar;
    }
    function add_location(element, file, line, column, char) {
        element.__svelte_meta = {
            loc: { file, line, column, char }
        };
    }
    function run(fn) {
        return fn();
    }
    function blank_object() {
        return Object.create(null);
    }
    function run_all(fns) {
        fns.forEach(run);
    }
    function is_function(thing) {
        return typeof thing === 'function';
    }
    function safe_not_equal(a, b) {
        return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
    }
    function validate_store(store, name) {
        if (store != null && typeof store.subscribe !== 'function') {
            throw new Error(`'${name}' is not a store with a 'subscribe' method`);
        }
    }
    function subscribe(store, ...callbacks) {
        if (store == null) {
            return noop;
        }
        const unsub = store.subscribe(...callbacks);
        return unsub.unsubscribe ? () => unsub.unsubscribe() : unsub;
    }
    function component_subscribe(component, store, callback) {
        component.$$.on_destroy.push(subscribe(store, callback));
    }
    function create_slot(definition, ctx, $$scope, fn) {
        if (definition) {
            const slot_ctx = get_slot_context(definition, ctx, $$scope, fn);
            return definition[0](slot_ctx);
        }
    }
    function get_slot_context(definition, ctx, $$scope, fn) {
        return definition[1] && fn
            ? assign($$scope.ctx.slice(), definition[1](fn(ctx)))
            : $$scope.ctx;
    }
    function get_slot_changes(definition, $$scope, dirty, fn) {
        if (definition[2] && fn) {
            const lets = definition[2](fn(dirty));
            if ($$scope.dirty === undefined) {
                return lets;
            }
            if (typeof lets === 'object') {
                const merged = [];
                const len = Math.max($$scope.dirty.length, lets.length);
                for (let i = 0; i < len; i += 1) {
                    merged[i] = $$scope.dirty[i] | lets[i];
                }
                return merged;
            }
            return $$scope.dirty | lets;
        }
        return $$scope.dirty;
    }
    function update_slot(slot, slot_definition, ctx, $$scope, dirty, get_slot_changes_fn, get_slot_context_fn) {
        const slot_changes = get_slot_changes(slot_definition, $$scope, dirty, get_slot_changes_fn);
        if (slot_changes) {
            const slot_context = get_slot_context(slot_definition, ctx, $$scope, get_slot_context_fn);
            slot.p(slot_context, slot_changes);
        }
    }

    const is_client = typeof window !== 'undefined';
    let now = is_client
        ? () => window.performance.now()
        : () => Date.now();
    let raf = is_client ? cb => requestAnimationFrame(cb) : noop;

    const tasks = new Set();
    function run_tasks(now) {
        tasks.forEach(task => {
            if (!task.c(now)) {
                tasks.delete(task);
                task.f();
            }
        });
        if (tasks.size !== 0)
            raf(run_tasks);
    }
    /**
     * Creates a new task that runs on each raf frame
     * until it returns a falsy value or is aborted
     */
    function loop(callback) {
        let task;
        if (tasks.size === 0)
            raf(run_tasks);
        return {
            promise: new Promise(fulfill => {
                tasks.add(task = { c: callback, f: fulfill });
            }),
            abort() {
                tasks.delete(task);
            }
        };
    }

    function append(target, node) {
        target.appendChild(node);
    }
    function insert(target, node, anchor) {
        target.insertBefore(node, anchor || null);
    }
    function detach(node) {
        node.parentNode.removeChild(node);
    }
    function destroy_each(iterations, detaching) {
        for (let i = 0; i < iterations.length; i += 1) {
            if (iterations[i])
                iterations[i].d(detaching);
        }
    }
    function element(name) {
        return document.createElement(name);
    }
    function svg_element(name) {
        return document.createElementNS('http://www.w3.org/2000/svg', name);
    }
    function text(data) {
        return document.createTextNode(data);
    }
    function space() {
        return text(' ');
    }
    function empty() {
        return text('');
    }
    function listen(node, event, handler, options) {
        node.addEventListener(event, handler, options);
        return () => node.removeEventListener(event, handler, options);
    }
    function attr(node, attribute, value) {
        if (value == null)
            node.removeAttribute(attribute);
        else if (node.getAttribute(attribute) !== value)
            node.setAttribute(attribute, value);
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function set_style(node, key, value, important) {
        node.style.setProperty(key, value, important ? 'important' : '');
    }
    function select_option(select, value) {
        for (let i = 0; i < select.options.length; i += 1) {
            const option = select.options[i];
            if (option.__value === value) {
                option.selected = true;
                return;
            }
        }
    }
    function select_value(select) {
        const selected_option = select.querySelector(':checked') || select.options[0];
        return selected_option && selected_option.__value;
    }
    // unfortunately this can't be a constant as that wouldn't be tree-shakeable
    // so we cache the result instead
    let crossorigin;
    function is_crossorigin() {
        if (crossorigin === undefined) {
            crossorigin = false;
            try {
                if (typeof window !== 'undefined' && window.parent) {
                    void window.parent.document;
                }
            }
            catch (error) {
                crossorigin = true;
            }
        }
        return crossorigin;
    }
    function add_resize_listener(node, fn) {
        const computed_style = getComputedStyle(node);
        const z_index = (parseInt(computed_style.zIndex) || 0) - 1;
        if (computed_style.position === 'static') {
            node.style.position = 'relative';
        }
        const iframe = element('iframe');
        iframe.setAttribute('style', `display: block; position: absolute; top: 0; left: 0; width: 100%; height: 100%; ` +
            `overflow: hidden; border: 0; opacity: 0; pointer-events: none; z-index: ${z_index};`);
        iframe.setAttribute('aria-hidden', 'true');
        iframe.tabIndex = -1;
        const crossorigin = is_crossorigin();
        let unsubscribe;
        if (crossorigin) {
            iframe.src = `data:text/html,<script>onresize=function(){parent.postMessage(0,'*')}</script>`;
            unsubscribe = listen(window, 'message', (event) => {
                if (event.source === iframe.contentWindow)
                    fn();
            });
        }
        else {
            iframe.src = 'about:blank';
            iframe.onload = () => {
                unsubscribe = listen(iframe.contentWindow, 'resize', fn);
            };
        }
        append(node, iframe);
        return () => {
            if (crossorigin) {
                unsubscribe();
            }
            else if (unsubscribe && iframe.contentWindow) {
                unsubscribe();
            }
            detach(iframe);
        };
    }
    function custom_event(type, detail) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, false, false, detail);
        return e;
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
    }
    function get_current_component() {
        if (!current_component)
            throw new Error(`Function called outside component initialization`);
        return current_component;
    }
    function setContext(key, context) {
        get_current_component().$$.context.set(key, context);
    }
    function getContext(key) {
        return get_current_component().$$.context.get(key);
    }

    const dirty_components = [];
    const binding_callbacks = [];
    const render_callbacks = [];
    const flush_callbacks = [];
    const resolved_promise = Promise.resolve();
    let update_scheduled = false;
    function schedule_update() {
        if (!update_scheduled) {
            update_scheduled = true;
            resolved_promise.then(flush);
        }
    }
    function add_render_callback(fn) {
        render_callbacks.push(fn);
    }
    let flushing = false;
    const seen_callbacks = new Set();
    function flush() {
        if (flushing)
            return;
        flushing = true;
        do {
            // first, call beforeUpdate functions
            // and update components
            for (let i = 0; i < dirty_components.length; i += 1) {
                const component = dirty_components[i];
                set_current_component(component);
                update(component.$$);
            }
            dirty_components.length = 0;
            while (binding_callbacks.length)
                binding_callbacks.pop()();
            // then, once components are updated, call
            // afterUpdate functions. This may cause
            // subsequent updates...
            for (let i = 0; i < render_callbacks.length; i += 1) {
                const callback = render_callbacks[i];
                if (!seen_callbacks.has(callback)) {
                    // ...so guard against infinite loops
                    seen_callbacks.add(callback);
                    callback();
                }
            }
            render_callbacks.length = 0;
        } while (dirty_components.length);
        while (flush_callbacks.length) {
            flush_callbacks.pop()();
        }
        update_scheduled = false;
        flushing = false;
        seen_callbacks.clear();
    }
    function update($$) {
        if ($$.fragment !== null) {
            $$.update();
            run_all($$.before_update);
            const dirty = $$.dirty;
            $$.dirty = [-1];
            $$.fragment && $$.fragment.p($$.ctx, dirty);
            $$.after_update.forEach(add_render_callback);
        }
    }
    const outroing = new Set();
    let outros;
    function group_outros() {
        outros = {
            r: 0,
            c: [],
            p: outros // parent group
        };
    }
    function check_outros() {
        if (!outros.r) {
            run_all(outros.c);
        }
        outros = outros.p;
    }
    function transition_in(block, local) {
        if (block && block.i) {
            outroing.delete(block);
            block.i(local);
        }
    }
    function transition_out(block, local, detach, callback) {
        if (block && block.o) {
            if (outroing.has(block))
                return;
            outroing.add(block);
            outros.c.push(() => {
                outroing.delete(block);
                if (callback) {
                    if (detach)
                        block.d(1);
                    callback();
                }
            });
            block.o(local);
        }
    }

    const globals = (typeof window !== 'undefined'
        ? window
        : typeof globalThis !== 'undefined'
            ? globalThis
            : global);
    function create_component(block) {
        block && block.c();
    }
    function mount_component(component, target, anchor) {
        const { fragment, on_mount, on_destroy, after_update } = component.$$;
        fragment && fragment.m(target, anchor);
        // onMount happens before the initial afterUpdate
        add_render_callback(() => {
            const new_on_destroy = on_mount.map(run).filter(is_function);
            if (on_destroy) {
                on_destroy.push(...new_on_destroy);
            }
            else {
                // Edge case - component was destroyed immediately,
                // most likely as a result of a binding initialising
                run_all(new_on_destroy);
            }
            component.$$.on_mount = [];
        });
        after_update.forEach(add_render_callback);
    }
    function destroy_component(component, detaching) {
        const $$ = component.$$;
        if ($$.fragment !== null) {
            run_all($$.on_destroy);
            $$.fragment && $$.fragment.d(detaching);
            // TODO null out other refs, including component.$$ (but need to
            // preserve final state?)
            $$.on_destroy = $$.fragment = null;
            $$.ctx = [];
        }
    }
    function make_dirty(component, i) {
        if (component.$$.dirty[0] === -1) {
            dirty_components.push(component);
            schedule_update();
            component.$$.dirty.fill(0);
        }
        component.$$.dirty[(i / 31) | 0] |= (1 << (i % 31));
    }
    function init(component, options, instance, create_fragment, not_equal, props, dirty = [-1]) {
        const parent_component = current_component;
        set_current_component(component);
        const prop_values = options.props || {};
        const $$ = component.$$ = {
            fragment: null,
            ctx: null,
            // state
            props,
            update: noop,
            not_equal,
            bound: blank_object(),
            // lifecycle
            on_mount: [],
            on_destroy: [],
            before_update: [],
            after_update: [],
            context: new Map(parent_component ? parent_component.$$.context : []),
            // everything else
            callbacks: blank_object(),
            dirty
        };
        let ready = false;
        $$.ctx = instance
            ? instance(component, prop_values, (i, ret, ...rest) => {
                const value = rest.length ? rest[0] : ret;
                if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
                    if ($$.bound[i])
                        $$.bound[i](value);
                    if (ready)
                        make_dirty(component, i);
                }
                return ret;
            })
            : [];
        $$.update();
        ready = true;
        run_all($$.before_update);
        // `false` as a special case of no DOM component
        $$.fragment = create_fragment ? create_fragment($$.ctx) : false;
        if (options.target) {
            if (options.hydrate) {
                const nodes = children(options.target);
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.l(nodes);
                nodes.forEach(detach);
            }
            else {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.c();
            }
            if (options.intro)
                transition_in(component.$$.fragment);
            mount_component(component, options.target, options.anchor);
            flush();
        }
        set_current_component(parent_component);
    }
    class SvelteComponent {
        $destroy() {
            destroy_component(this, 1);
            this.$destroy = noop;
        }
        $on(type, callback) {
            const callbacks = (this.$$.callbacks[type] || (this.$$.callbacks[type] = []));
            callbacks.push(callback);
            return () => {
                const index = callbacks.indexOf(callback);
                if (index !== -1)
                    callbacks.splice(index, 1);
            };
        }
        $set() {
            // overridden by instance, if it has props
        }
    }

    function dispatch_dev(type, detail) {
        document.dispatchEvent(custom_event(type, Object.assign({ version: '3.23.2' }, detail)));
    }
    function append_dev(target, node) {
        dispatch_dev("SvelteDOMInsert", { target, node });
        append(target, node);
    }
    function insert_dev(target, node, anchor) {
        dispatch_dev("SvelteDOMInsert", { target, node, anchor });
        insert(target, node, anchor);
    }
    function detach_dev(node) {
        dispatch_dev("SvelteDOMRemove", { node });
        detach(node);
    }
    function listen_dev(node, event, handler, options, has_prevent_default, has_stop_propagation) {
        const modifiers = options === true ? ["capture"] : options ? Array.from(Object.keys(options)) : [];
        if (has_prevent_default)
            modifiers.push('preventDefault');
        if (has_stop_propagation)
            modifiers.push('stopPropagation');
        dispatch_dev("SvelteDOMAddEventListener", { node, event, handler, modifiers });
        const dispose = listen(node, event, handler, options);
        return () => {
            dispatch_dev("SvelteDOMRemoveEventListener", { node, event, handler, modifiers });
            dispose();
        };
    }
    function attr_dev(node, attribute, value) {
        attr(node, attribute, value);
        if (value == null)
            dispatch_dev("SvelteDOMRemoveAttribute", { node, attribute });
        else
            dispatch_dev("SvelteDOMSetAttribute", { node, attribute, value });
    }
    function set_data_dev(text, data) {
        data = '' + data;
        if (text.data === data)
            return;
        dispatch_dev("SvelteDOMSetData", { node: text, data });
        text.data = data;
    }
    function validate_each_argument(arg) {
        if (typeof arg !== 'string' && !(arg && typeof arg === 'object' && 'length' in arg)) {
            let msg = '{#each} only iterates over array-like objects.';
            if (typeof Symbol === 'function' && arg && Symbol.iterator in arg) {
                msg += ' You can use a spread to convert this iterable into an array.';
            }
            throw new Error(msg);
        }
    }
    function validate_slots(name, slot, keys) {
        for (const slot_key of Object.keys(slot)) {
            if (!~keys.indexOf(slot_key)) {
                console.warn(`<${name}> received an unexpected slot "${slot_key}".`);
            }
        }
    }
    class SvelteComponentDev extends SvelteComponent {
        constructor(options) {
            if (!options || (!options.target && !options.$$inline)) {
                throw new Error(`'target' is a required option`);
            }
            super();
        }
        $destroy() {
            super.$destroy();
            this.$destroy = () => {
                console.warn(`Component was already destroyed`); // eslint-disable-line no-console
            };
        }
        $capture_state() { }
        $inject_state() { }
    }

    const subscriber_queue = [];
    /**
     * Creates a `Readable` store that allows reading by subscription.
     * @param value initial value
     * @param {StartStopNotifier}start start and stop notifications for subscriptions
     */
    function readable(value, start) {
        return {
            subscribe: writable(value, start).subscribe,
        };
    }
    /**
     * Create a `Writable` store that allows both updating and reading by subscription.
     * @param {*=}value initial value
     * @param {StartStopNotifier=}start start and stop notifications for subscriptions
     */
    function writable(value, start = noop) {
        let stop;
        const subscribers = [];
        function set(new_value) {
            if (safe_not_equal(value, new_value)) {
                value = new_value;
                if (stop) { // store is ready
                    const run_queue = !subscriber_queue.length;
                    for (let i = 0; i < subscribers.length; i += 1) {
                        const s = subscribers[i];
                        s[1]();
                        subscriber_queue.push(s, value);
                    }
                    if (run_queue) {
                        for (let i = 0; i < subscriber_queue.length; i += 2) {
                            subscriber_queue[i][0](subscriber_queue[i + 1]);
                        }
                        subscriber_queue.length = 0;
                    }
                }
            }
        }
        function update(fn) {
            set(fn(value));
        }
        function subscribe(run, invalidate = noop) {
            const subscriber = [run, invalidate];
            subscribers.push(subscriber);
            if (subscribers.length === 1) {
                stop = start(set) || noop;
            }
            run(value);
            return () => {
                const index = subscribers.indexOf(subscriber);
                if (index !== -1) {
                    subscribers.splice(index, 1);
                }
                if (subscribers.length === 0) {
                    stop();
                    stop = null;
                }
            };
        }
        return { set, update, subscribe };
    }
    function derived(stores, fn, initial_value) {
        const single = !Array.isArray(stores);
        const stores_array = single
            ? [stores]
            : stores;
        const auto = fn.length < 2;
        return readable(initial_value, (set) => {
            let inited = false;
            const values = [];
            let pending = 0;
            let cleanup = noop;
            const sync = () => {
                if (pending) {
                    return;
                }
                cleanup();
                const result = fn(single ? values[0] : values, set);
                if (auto) {
                    set(result);
                }
                else {
                    cleanup = is_function(result) ? result : noop;
                }
            };
            const unsubscribers = stores_array.map((store, i) => subscribe(store, (value) => {
                values[i] = value;
                pending &= ~(1 << i);
                if (inited) {
                    sync();
                }
            }, () => {
                pending |= (1 << i);
            }));
            inited = true;
            sync();
            return function stop() {
                run_all(unsubscribers);
                cleanup();
            };
        });
    }

    /* --------------------------------------------
     *
     * Return a truthy value if is zero
     *
     * --------------------------------------------
     */
    function canBeZero (val) {
    	if (val === 0) {
    		return true;
    	}
    	return val;
    }

    function makeAccessor (acc) {
    	if (!canBeZero(acc)) return null;
    	if (Array.isArray(acc)) {
    		return d => acc.map(k => {
    			return typeof k !== 'function' ? d[k] : k(d);
    		});
    	} else if (typeof acc !== 'function') { // eslint-disable-line no-else-return
    		return d => d[acc];
    	}
    	return acc;
    }

    /* --------------------------------------------
     *
     * Remove undefined fields from an object
     *
     * --------------------------------------------
     */

    // From Object.fromEntries polyfill https://github.com/tc39/proposal-object-from-entries/blob/master/polyfill.js#L1
    function fromEntries(iter) {
    	const obj = {};

    	for (const pair of iter) {
    		if (Object(pair) !== pair) {
    			throw new TypeError("iterable for fromEntries should yield objects");
    		}

    		// Consistency with Map: contract is that entry has "0" and "1" keys, not
    		// that it is an array or iterable.

    		const { "0": key, "1": val } = pair;

    		Object.defineProperty(obj, key, {
    			configurable: true,
    			enumerable: true,
    			writable: true,
    			value: val,
    		});
    	}

    	return obj;
    }

    function filterObject (obj) {
    	return fromEntries(Object.entries(obj).filter(([key, value]) => {
    		return value !== undefined;
    	}));
    }

    /* --------------------------------------------
     *
     * Calculate the extents of desired fields
     * Returns an object like:
     * `{x: [0, 10], y: [-10, 10]}` if `fields` is
     * `[{field:'x', accessor: d => d.x}, {field:'y', accessor: d => d.y}]`
     *
     * --------------------------------------------
     */
    function calcExtents (data, fields) {
    	if (!Array.isArray(data) || data.length === 0) return null;
    	const extents = {};
    	const fl = fields.length;
    	let i;
    	let j;
    	let f;
    	let val;
    	let s;

    	if (fl) {
    		for (i = 0; i < fl; i += 1) {
    			const firstRow = fields[i].accessor(data[0]);
    			if (firstRow === undefined || firstRow === null || Number.isNaN(firstRow) === true) {
    				extents[fields[i].field] = [Infinity, -Infinity];
    			} else {
    				extents[fields[i].field] = Array.isArray(firstRow) ? firstRow : [firstRow, firstRow];
    			}
    		}
    		const dl = data.length;
    		for (i = 0; i < dl; i += 1) {
    			for (j = 0; j < fl; j += 1) {
    				f = fields[j];
    				val = f.accessor(data[i]);
    				s = f.field;
    				if (Array.isArray(val)) {
    					const vl = val.length;
    					for (let k = 0; k < vl; k += 1) {
    						if (val[k] !== undefined && val[k] !== null && Number.isNaN(val[k]) === false) {
    							if (val[k] < extents[s][0]) {
    								extents[s][0] = val[k];
    							}
    							if (val[k] > extents[s][1]) {
    								extents[s][1] = val[k];
    							}
    						}
    					}
    				} else if (val !== undefined && val !== null && Number.isNaN(val) === false) {
    					if (val < extents[s][0]) {
    						extents[s][0] = val;
    					}
    					if (val > extents[s][1]) {
    						extents[s][1] = val;
    					}
    				}
    			}
    		}
    	} else {
    		return null;
    	}
    	return extents;
    }

    /* --------------------------------------------
     * If we have a domain from settings, fill in
     * any null values with ones from our measured extents
     * otherwise, return the measured extent
     */
    function partialDomain (domain = [], directive) {
    	if (Array.isArray(directive) === true) {
    		return directive.map((d, i) => {
    			if (d === null) {
    				return domain[i];
    			}
    			return d;
    		});
    	}
    	return domain;
    }

    function calcDomain (s) {
    	return function domainCalc ([$extents, $domain]) {
    		return $extents ? partialDomain($extents[s], $domain) : $domain;
    	};
    }

    function ascending(a, b) {
      return a < b ? -1 : a > b ? 1 : a >= b ? 0 : NaN;
    }

    function bisector(f) {
      let delta = f;
      let compare = f;

      if (f.length === 1) {
        delta = (d, x) => f(d) - x;
        compare = ascendingComparator(f);
      }

      function left(a, x, lo, hi) {
        if (lo == null) lo = 0;
        if (hi == null) hi = a.length;
        while (lo < hi) {
          const mid = (lo + hi) >>> 1;
          if (compare(a[mid], x) < 0) lo = mid + 1;
          else hi = mid;
        }
        return lo;
      }

      function right(a, x, lo, hi) {
        if (lo == null) lo = 0;
        if (hi == null) hi = a.length;
        while (lo < hi) {
          const mid = (lo + hi) >>> 1;
          if (compare(a[mid], x) > 0) hi = mid;
          else lo = mid + 1;
        }
        return lo;
      }

      function center(a, x, lo, hi) {
        if (lo == null) lo = 0;
        if (hi == null) hi = a.length;
        const i = left(a, x, lo, hi - 1);
        return i > lo && delta(a[i - 1], x) > -delta(a[i], x) ? i - 1 : i;
      }

      return {left, center, right};
    }

    function ascendingComparator(f) {
      return (d, x) => ascending(f(d), x);
    }

    function number(x) {
      return x === null ? NaN : +x;
    }

    const ascendingBisect = bisector(ascending);
    const bisectRight = ascendingBisect.right;
    const bisectCenter = bisector(number).center;

    var e10 = Math.sqrt(50),
        e5 = Math.sqrt(10),
        e2 = Math.sqrt(2);

    function ticks(start, stop, count) {
      var reverse,
          i = -1,
          n,
          ticks,
          step;

      stop = +stop, start = +start, count = +count;
      if (start === stop && count > 0) return [start];
      if (reverse = stop < start) n = start, start = stop, stop = n;
      if ((step = tickIncrement(start, stop, count)) === 0 || !isFinite(step)) return [];

      if (step > 0) {
        start = Math.ceil(start / step);
        stop = Math.floor(stop / step);
        ticks = new Array(n = Math.ceil(stop - start + 1));
        while (++i < n) ticks[i] = (start + i) * step;
      } else {
        step = -step;
        start = Math.ceil(start * step);
        stop = Math.floor(stop * step);
        ticks = new Array(n = Math.ceil(stop - start + 1));
        while (++i < n) ticks[i] = (start + i) / step;
      }

      if (reverse) ticks.reverse();

      return ticks;
    }

    function tickIncrement(start, stop, count) {
      var step = (stop - start) / Math.max(0, count),
          power = Math.floor(Math.log(step) / Math.LN10),
          error = step / Math.pow(10, power);
      return power >= 0
          ? (error >= e10 ? 10 : error >= e5 ? 5 : error >= e2 ? 2 : 1) * Math.pow(10, power)
          : -Math.pow(10, -power) / (error >= e10 ? 10 : error >= e5 ? 5 : error >= e2 ? 2 : 1);
    }

    function tickStep(start, stop, count) {
      var step0 = Math.abs(stop - start) / Math.max(0, count),
          step1 = Math.pow(10, Math.floor(Math.log(step0) / Math.LN10)),
          error = step0 / step1;
      if (error >= e10) step1 *= 10;
      else if (error >= e5) step1 *= 5;
      else if (error >= e2) step1 *= 2;
      return stop < start ? -step1 : step1;
    }

    function initRange(domain, range) {
      switch (arguments.length) {
        case 0: break;
        case 1: this.range(domain); break;
        default: this.range(range).domain(domain); break;
      }
      return this;
    }

    function define(constructor, factory, prototype) {
      constructor.prototype = factory.prototype = prototype;
      prototype.constructor = constructor;
    }

    function extend(parent, definition) {
      var prototype = Object.create(parent.prototype);
      for (var key in definition) prototype[key] = definition[key];
      return prototype;
    }

    function Color() {}

    var darker = 0.7;
    var brighter = 1 / darker;

    var reI = "\\s*([+-]?\\d+)\\s*",
        reN = "\\s*([+-]?\\d*\\.?\\d+(?:[eE][+-]?\\d+)?)\\s*",
        reP = "\\s*([+-]?\\d*\\.?\\d+(?:[eE][+-]?\\d+)?)%\\s*",
        reHex = /^#([0-9a-f]{3,8})$/,
        reRgbInteger = new RegExp("^rgb\\(" + [reI, reI, reI] + "\\)$"),
        reRgbPercent = new RegExp("^rgb\\(" + [reP, reP, reP] + "\\)$"),
        reRgbaInteger = new RegExp("^rgba\\(" + [reI, reI, reI, reN] + "\\)$"),
        reRgbaPercent = new RegExp("^rgba\\(" + [reP, reP, reP, reN] + "\\)$"),
        reHslPercent = new RegExp("^hsl\\(" + [reN, reP, reP] + "\\)$"),
        reHslaPercent = new RegExp("^hsla\\(" + [reN, reP, reP, reN] + "\\)$");

    var named = {
      aliceblue: 0xf0f8ff,
      antiquewhite: 0xfaebd7,
      aqua: 0x00ffff,
      aquamarine: 0x7fffd4,
      azure: 0xf0ffff,
      beige: 0xf5f5dc,
      bisque: 0xffe4c4,
      black: 0x000000,
      blanchedalmond: 0xffebcd,
      blue: 0x0000ff,
      blueviolet: 0x8a2be2,
      brown: 0xa52a2a,
      burlywood: 0xdeb887,
      cadetblue: 0x5f9ea0,
      chartreuse: 0x7fff00,
      chocolate: 0xd2691e,
      coral: 0xff7f50,
      cornflowerblue: 0x6495ed,
      cornsilk: 0xfff8dc,
      crimson: 0xdc143c,
      cyan: 0x00ffff,
      darkblue: 0x00008b,
      darkcyan: 0x008b8b,
      darkgoldenrod: 0xb8860b,
      darkgray: 0xa9a9a9,
      darkgreen: 0x006400,
      darkgrey: 0xa9a9a9,
      darkkhaki: 0xbdb76b,
      darkmagenta: 0x8b008b,
      darkolivegreen: 0x556b2f,
      darkorange: 0xff8c00,
      darkorchid: 0x9932cc,
      darkred: 0x8b0000,
      darksalmon: 0xe9967a,
      darkseagreen: 0x8fbc8f,
      darkslateblue: 0x483d8b,
      darkslategray: 0x2f4f4f,
      darkslategrey: 0x2f4f4f,
      darkturquoise: 0x00ced1,
      darkviolet: 0x9400d3,
      deeppink: 0xff1493,
      deepskyblue: 0x00bfff,
      dimgray: 0x696969,
      dimgrey: 0x696969,
      dodgerblue: 0x1e90ff,
      firebrick: 0xb22222,
      floralwhite: 0xfffaf0,
      forestgreen: 0x228b22,
      fuchsia: 0xff00ff,
      gainsboro: 0xdcdcdc,
      ghostwhite: 0xf8f8ff,
      gold: 0xffd700,
      goldenrod: 0xdaa520,
      gray: 0x808080,
      green: 0x008000,
      greenyellow: 0xadff2f,
      grey: 0x808080,
      honeydew: 0xf0fff0,
      hotpink: 0xff69b4,
      indianred: 0xcd5c5c,
      indigo: 0x4b0082,
      ivory: 0xfffff0,
      khaki: 0xf0e68c,
      lavender: 0xe6e6fa,
      lavenderblush: 0xfff0f5,
      lawngreen: 0x7cfc00,
      lemonchiffon: 0xfffacd,
      lightblue: 0xadd8e6,
      lightcoral: 0xf08080,
      lightcyan: 0xe0ffff,
      lightgoldenrodyellow: 0xfafad2,
      lightgray: 0xd3d3d3,
      lightgreen: 0x90ee90,
      lightgrey: 0xd3d3d3,
      lightpink: 0xffb6c1,
      lightsalmon: 0xffa07a,
      lightseagreen: 0x20b2aa,
      lightskyblue: 0x87cefa,
      lightslategray: 0x778899,
      lightslategrey: 0x778899,
      lightsteelblue: 0xb0c4de,
      lightyellow: 0xffffe0,
      lime: 0x00ff00,
      limegreen: 0x32cd32,
      linen: 0xfaf0e6,
      magenta: 0xff00ff,
      maroon: 0x800000,
      mediumaquamarine: 0x66cdaa,
      mediumblue: 0x0000cd,
      mediumorchid: 0xba55d3,
      mediumpurple: 0x9370db,
      mediumseagreen: 0x3cb371,
      mediumslateblue: 0x7b68ee,
      mediumspringgreen: 0x00fa9a,
      mediumturquoise: 0x48d1cc,
      mediumvioletred: 0xc71585,
      midnightblue: 0x191970,
      mintcream: 0xf5fffa,
      mistyrose: 0xffe4e1,
      moccasin: 0xffe4b5,
      navajowhite: 0xffdead,
      navy: 0x000080,
      oldlace: 0xfdf5e6,
      olive: 0x808000,
      olivedrab: 0x6b8e23,
      orange: 0xffa500,
      orangered: 0xff4500,
      orchid: 0xda70d6,
      palegoldenrod: 0xeee8aa,
      palegreen: 0x98fb98,
      paleturquoise: 0xafeeee,
      palevioletred: 0xdb7093,
      papayawhip: 0xffefd5,
      peachpuff: 0xffdab9,
      peru: 0xcd853f,
      pink: 0xffc0cb,
      plum: 0xdda0dd,
      powderblue: 0xb0e0e6,
      purple: 0x800080,
      rebeccapurple: 0x663399,
      red: 0xff0000,
      rosybrown: 0xbc8f8f,
      royalblue: 0x4169e1,
      saddlebrown: 0x8b4513,
      salmon: 0xfa8072,
      sandybrown: 0xf4a460,
      seagreen: 0x2e8b57,
      seashell: 0xfff5ee,
      sienna: 0xa0522d,
      silver: 0xc0c0c0,
      skyblue: 0x87ceeb,
      slateblue: 0x6a5acd,
      slategray: 0x708090,
      slategrey: 0x708090,
      snow: 0xfffafa,
      springgreen: 0x00ff7f,
      steelblue: 0x4682b4,
      tan: 0xd2b48c,
      teal: 0x008080,
      thistle: 0xd8bfd8,
      tomato: 0xff6347,
      turquoise: 0x40e0d0,
      violet: 0xee82ee,
      wheat: 0xf5deb3,
      white: 0xffffff,
      whitesmoke: 0xf5f5f5,
      yellow: 0xffff00,
      yellowgreen: 0x9acd32
    };

    define(Color, color, {
      copy: function(channels) {
        return Object.assign(new this.constructor, this, channels);
      },
      displayable: function() {
        return this.rgb().displayable();
      },
      hex: color_formatHex, // Deprecated! Use color.formatHex.
      formatHex: color_formatHex,
      formatHsl: color_formatHsl,
      formatRgb: color_formatRgb,
      toString: color_formatRgb
    });

    function color_formatHex() {
      return this.rgb().formatHex();
    }

    function color_formatHsl() {
      return hslConvert(this).formatHsl();
    }

    function color_formatRgb() {
      return this.rgb().formatRgb();
    }

    function color(format) {
      var m, l;
      format = (format + "").trim().toLowerCase();
      return (m = reHex.exec(format)) ? (l = m[1].length, m = parseInt(m[1], 16), l === 6 ? rgbn(m) // #ff0000
          : l === 3 ? new Rgb((m >> 8 & 0xf) | (m >> 4 & 0xf0), (m >> 4 & 0xf) | (m & 0xf0), ((m & 0xf) << 4) | (m & 0xf), 1) // #f00
          : l === 8 ? rgba(m >> 24 & 0xff, m >> 16 & 0xff, m >> 8 & 0xff, (m & 0xff) / 0xff) // #ff000000
          : l === 4 ? rgba((m >> 12 & 0xf) | (m >> 8 & 0xf0), (m >> 8 & 0xf) | (m >> 4 & 0xf0), (m >> 4 & 0xf) | (m & 0xf0), (((m & 0xf) << 4) | (m & 0xf)) / 0xff) // #f000
          : null) // invalid hex
          : (m = reRgbInteger.exec(format)) ? new Rgb(m[1], m[2], m[3], 1) // rgb(255, 0, 0)
          : (m = reRgbPercent.exec(format)) ? new Rgb(m[1] * 255 / 100, m[2] * 255 / 100, m[3] * 255 / 100, 1) // rgb(100%, 0%, 0%)
          : (m = reRgbaInteger.exec(format)) ? rgba(m[1], m[2], m[3], m[4]) // rgba(255, 0, 0, 1)
          : (m = reRgbaPercent.exec(format)) ? rgba(m[1] * 255 / 100, m[2] * 255 / 100, m[3] * 255 / 100, m[4]) // rgb(100%, 0%, 0%, 1)
          : (m = reHslPercent.exec(format)) ? hsla(m[1], m[2] / 100, m[3] / 100, 1) // hsl(120, 50%, 50%)
          : (m = reHslaPercent.exec(format)) ? hsla(m[1], m[2] / 100, m[3] / 100, m[4]) // hsla(120, 50%, 50%, 1)
          : named.hasOwnProperty(format) ? rgbn(named[format]) // eslint-disable-line no-prototype-builtins
          : format === "transparent" ? new Rgb(NaN, NaN, NaN, 0)
          : null;
    }

    function rgbn(n) {
      return new Rgb(n >> 16 & 0xff, n >> 8 & 0xff, n & 0xff, 1);
    }

    function rgba(r, g, b, a) {
      if (a <= 0) r = g = b = NaN;
      return new Rgb(r, g, b, a);
    }

    function rgbConvert(o) {
      if (!(o instanceof Color)) o = color(o);
      if (!o) return new Rgb;
      o = o.rgb();
      return new Rgb(o.r, o.g, o.b, o.opacity);
    }

    function rgb(r, g, b, opacity) {
      return arguments.length === 1 ? rgbConvert(r) : new Rgb(r, g, b, opacity == null ? 1 : opacity);
    }

    function Rgb(r, g, b, opacity) {
      this.r = +r;
      this.g = +g;
      this.b = +b;
      this.opacity = +opacity;
    }

    define(Rgb, rgb, extend(Color, {
      brighter: function(k) {
        k = k == null ? brighter : Math.pow(brighter, k);
        return new Rgb(this.r * k, this.g * k, this.b * k, this.opacity);
      },
      darker: function(k) {
        k = k == null ? darker : Math.pow(darker, k);
        return new Rgb(this.r * k, this.g * k, this.b * k, this.opacity);
      },
      rgb: function() {
        return this;
      },
      displayable: function() {
        return (-0.5 <= this.r && this.r < 255.5)
            && (-0.5 <= this.g && this.g < 255.5)
            && (-0.5 <= this.b && this.b < 255.5)
            && (0 <= this.opacity && this.opacity <= 1);
      },
      hex: rgb_formatHex, // Deprecated! Use color.formatHex.
      formatHex: rgb_formatHex,
      formatRgb: rgb_formatRgb,
      toString: rgb_formatRgb
    }));

    function rgb_formatHex() {
      return "#" + hex(this.r) + hex(this.g) + hex(this.b);
    }

    function rgb_formatRgb() {
      var a = this.opacity; a = isNaN(a) ? 1 : Math.max(0, Math.min(1, a));
      return (a === 1 ? "rgb(" : "rgba(")
          + Math.max(0, Math.min(255, Math.round(this.r) || 0)) + ", "
          + Math.max(0, Math.min(255, Math.round(this.g) || 0)) + ", "
          + Math.max(0, Math.min(255, Math.round(this.b) || 0))
          + (a === 1 ? ")" : ", " + a + ")");
    }

    function hex(value) {
      value = Math.max(0, Math.min(255, Math.round(value) || 0));
      return (value < 16 ? "0" : "") + value.toString(16);
    }

    function hsla(h, s, l, a) {
      if (a <= 0) h = s = l = NaN;
      else if (l <= 0 || l >= 1) h = s = NaN;
      else if (s <= 0) h = NaN;
      return new Hsl(h, s, l, a);
    }

    function hslConvert(o) {
      if (o instanceof Hsl) return new Hsl(o.h, o.s, o.l, o.opacity);
      if (!(o instanceof Color)) o = color(o);
      if (!o) return new Hsl;
      if (o instanceof Hsl) return o;
      o = o.rgb();
      var r = o.r / 255,
          g = o.g / 255,
          b = o.b / 255,
          min = Math.min(r, g, b),
          max = Math.max(r, g, b),
          h = NaN,
          s = max - min,
          l = (max + min) / 2;
      if (s) {
        if (r === max) h = (g - b) / s + (g < b) * 6;
        else if (g === max) h = (b - r) / s + 2;
        else h = (r - g) / s + 4;
        s /= l < 0.5 ? max + min : 2 - max - min;
        h *= 60;
      } else {
        s = l > 0 && l < 1 ? 0 : h;
      }
      return new Hsl(h, s, l, o.opacity);
    }

    function hsl(h, s, l, opacity) {
      return arguments.length === 1 ? hslConvert(h) : new Hsl(h, s, l, opacity == null ? 1 : opacity);
    }

    function Hsl(h, s, l, opacity) {
      this.h = +h;
      this.s = +s;
      this.l = +l;
      this.opacity = +opacity;
    }

    define(Hsl, hsl, extend(Color, {
      brighter: function(k) {
        k = k == null ? brighter : Math.pow(brighter, k);
        return new Hsl(this.h, this.s, this.l * k, this.opacity);
      },
      darker: function(k) {
        k = k == null ? darker : Math.pow(darker, k);
        return new Hsl(this.h, this.s, this.l * k, this.opacity);
      },
      rgb: function() {
        var h = this.h % 360 + (this.h < 0) * 360,
            s = isNaN(h) || isNaN(this.s) ? 0 : this.s,
            l = this.l,
            m2 = l + (l < 0.5 ? l : 1 - l) * s,
            m1 = 2 * l - m2;
        return new Rgb(
          hsl2rgb(h >= 240 ? h - 240 : h + 120, m1, m2),
          hsl2rgb(h, m1, m2),
          hsl2rgb(h < 120 ? h + 240 : h - 120, m1, m2),
          this.opacity
        );
      },
      displayable: function() {
        return (0 <= this.s && this.s <= 1 || isNaN(this.s))
            && (0 <= this.l && this.l <= 1)
            && (0 <= this.opacity && this.opacity <= 1);
      },
      formatHsl: function() {
        var a = this.opacity; a = isNaN(a) ? 1 : Math.max(0, Math.min(1, a));
        return (a === 1 ? "hsl(" : "hsla(")
            + (this.h || 0) + ", "
            + (this.s || 0) * 100 + "%, "
            + (this.l || 0) * 100 + "%"
            + (a === 1 ? ")" : ", " + a + ")");
      }
    }));

    /* From FvD 13.37, CSS Color Module Level 3 */
    function hsl2rgb(h, m1, m2) {
      return (h < 60 ? m1 + (m2 - m1) * h / 60
          : h < 180 ? m2
          : h < 240 ? m1 + (m2 - m1) * (240 - h) / 60
          : m1) * 255;
    }

    var constant = x => () => x;

    function linear(a, d) {
      return function(t) {
        return a + t * d;
      };
    }

    function exponential(a, b, y) {
      return a = Math.pow(a, y), b = Math.pow(b, y) - a, y = 1 / y, function(t) {
        return Math.pow(a + t * b, y);
      };
    }

    function gamma(y) {
      return (y = +y) === 1 ? nogamma : function(a, b) {
        return b - a ? exponential(a, b, y) : constant(isNaN(a) ? b : a);
      };
    }

    function nogamma(a, b) {
      var d = b - a;
      return d ? linear(a, d) : constant(isNaN(a) ? b : a);
    }

    var rgb$1 = (function rgbGamma(y) {
      var color = gamma(y);

      function rgb$1(start, end) {
        var r = color((start = rgb(start)).r, (end = rgb(end)).r),
            g = color(start.g, end.g),
            b = color(start.b, end.b),
            opacity = nogamma(start.opacity, end.opacity);
        return function(t) {
          start.r = r(t);
          start.g = g(t);
          start.b = b(t);
          start.opacity = opacity(t);
          return start + "";
        };
      }

      rgb$1.gamma = rgbGamma;

      return rgb$1;
    })(1);

    function numberArray(a, b) {
      if (!b) b = [];
      var n = a ? Math.min(b.length, a.length) : 0,
          c = b.slice(),
          i;
      return function(t) {
        for (i = 0; i < n; ++i) c[i] = a[i] * (1 - t) + b[i] * t;
        return c;
      };
    }

    function isNumberArray(x) {
      return ArrayBuffer.isView(x) && !(x instanceof DataView);
    }

    function genericArray(a, b) {
      var nb = b ? b.length : 0,
          na = a ? Math.min(nb, a.length) : 0,
          x = new Array(na),
          c = new Array(nb),
          i;

      for (i = 0; i < na; ++i) x[i] = interpolate(a[i], b[i]);
      for (; i < nb; ++i) c[i] = b[i];

      return function(t) {
        for (i = 0; i < na; ++i) c[i] = x[i](t);
        return c;
      };
    }

    function date(a, b) {
      var d = new Date;
      return a = +a, b = +b, function(t) {
        return d.setTime(a * (1 - t) + b * t), d;
      };
    }

    function interpolateNumber(a, b) {
      return a = +a, b = +b, function(t) {
        return a * (1 - t) + b * t;
      };
    }

    function object(a, b) {
      var i = {},
          c = {},
          k;

      if (a === null || typeof a !== "object") a = {};
      if (b === null || typeof b !== "object") b = {};

      for (k in b) {
        if (k in a) {
          i[k] = interpolate(a[k], b[k]);
        } else {
          c[k] = b[k];
        }
      }

      return function(t) {
        for (k in i) c[k] = i[k](t);
        return c;
      };
    }

    var reA = /[-+]?(?:\d+\.?\d*|\.?\d+)(?:[eE][-+]?\d+)?/g,
        reB = new RegExp(reA.source, "g");

    function zero(b) {
      return function() {
        return b;
      };
    }

    function one(b) {
      return function(t) {
        return b(t) + "";
      };
    }

    function string(a, b) {
      var bi = reA.lastIndex = reB.lastIndex = 0, // scan index for next number in b
          am, // current match in a
          bm, // current match in b
          bs, // string preceding current number in b, if any
          i = -1, // index in s
          s = [], // string constants and placeholders
          q = []; // number interpolators

      // Coerce inputs to strings.
      a = a + "", b = b + "";

      // Interpolate pairs of numbers in a & b.
      while ((am = reA.exec(a))
          && (bm = reB.exec(b))) {
        if ((bs = bm.index) > bi) { // a string precedes the next number in b
          bs = b.slice(bi, bs);
          if (s[i]) s[i] += bs; // coalesce with previous string
          else s[++i] = bs;
        }
        if ((am = am[0]) === (bm = bm[0])) { // numbers in a & b match
          if (s[i]) s[i] += bm; // coalesce with previous string
          else s[++i] = bm;
        } else { // interpolate non-matching numbers
          s[++i] = null;
          q.push({i: i, x: interpolateNumber(am, bm)});
        }
        bi = reB.lastIndex;
      }

      // Add remains of b.
      if (bi < b.length) {
        bs = b.slice(bi);
        if (s[i]) s[i] += bs; // coalesce with previous string
        else s[++i] = bs;
      }

      // Special optimization for only a single match.
      // Otherwise, interpolate each of the numbers and rejoin the string.
      return s.length < 2 ? (q[0]
          ? one(q[0].x)
          : zero(b))
          : (b = q.length, function(t) {
              for (var i = 0, o; i < b; ++i) s[(o = q[i]).i] = o.x(t);
              return s.join("");
            });
    }

    function interpolate(a, b) {
      var t = typeof b, c;
      return b == null || t === "boolean" ? constant(b)
          : (t === "number" ? interpolateNumber
          : t === "string" ? ((c = color(b)) ? (b = c, rgb$1) : string)
          : b instanceof color ? rgb$1
          : b instanceof Date ? date
          : isNumberArray(b) ? numberArray
          : Array.isArray(b) ? genericArray
          : typeof b.valueOf !== "function" && typeof b.toString !== "function" || isNaN(b) ? object
          : interpolateNumber)(a, b);
    }

    function interpolateRound(a, b) {
      return a = +a, b = +b, function(t) {
        return Math.round(a * (1 - t) + b * t);
      };
    }

    function constants(x) {
      return function() {
        return x;
      };
    }

    function number$1(x) {
      return +x;
    }

    var unit = [0, 1];

    function identity$1(x) {
      return x;
    }

    function normalize(a, b) {
      return (b -= (a = +a))
          ? function(x) { return (x - a) / b; }
          : constants(isNaN(b) ? NaN : 0.5);
    }

    function clamper(a, b) {
      var t;
      if (a > b) t = a, a = b, b = t;
      return function(x) { return Math.max(a, Math.min(b, x)); };
    }

    // normalize(a, b)(x) takes a domain value x in [a,b] and returns the corresponding parameter t in [0,1].
    // interpolate(a, b)(t) takes a parameter t in [0,1] and returns the corresponding range value x in [a,b].
    function bimap(domain, range, interpolate) {
      var d0 = domain[0], d1 = domain[1], r0 = range[0], r1 = range[1];
      if (d1 < d0) d0 = normalize(d1, d0), r0 = interpolate(r1, r0);
      else d0 = normalize(d0, d1), r0 = interpolate(r0, r1);
      return function(x) { return r0(d0(x)); };
    }

    function polymap(domain, range, interpolate) {
      var j = Math.min(domain.length, range.length) - 1,
          d = new Array(j),
          r = new Array(j),
          i = -1;

      // Reverse descending domains.
      if (domain[j] < domain[0]) {
        domain = domain.slice().reverse();
        range = range.slice().reverse();
      }

      while (++i < j) {
        d[i] = normalize(domain[i], domain[i + 1]);
        r[i] = interpolate(range[i], range[i + 1]);
      }

      return function(x) {
        var i = bisectRight(domain, x, 1, j) - 1;
        return r[i](d[i](x));
      };
    }

    function copy(source, target) {
      return target
          .domain(source.domain())
          .range(source.range())
          .interpolate(source.interpolate())
          .clamp(source.clamp())
          .unknown(source.unknown());
    }

    function transformer() {
      var domain = unit,
          range = unit,
          interpolate$1 = interpolate,
          transform,
          untransform,
          unknown,
          clamp = identity$1,
          piecewise,
          output,
          input;

      function rescale() {
        var n = Math.min(domain.length, range.length);
        if (clamp !== identity$1) clamp = clamper(domain[0], domain[n - 1]);
        piecewise = n > 2 ? polymap : bimap;
        output = input = null;
        return scale;
      }

      function scale(x) {
        return isNaN(x = +x) ? unknown : (output || (output = piecewise(domain.map(transform), range, interpolate$1)))(transform(clamp(x)));
      }

      scale.invert = function(y) {
        return clamp(untransform((input || (input = piecewise(range, domain.map(transform), interpolateNumber)))(y)));
      };

      scale.domain = function(_) {
        return arguments.length ? (domain = Array.from(_, number$1), rescale()) : domain.slice();
      };

      scale.range = function(_) {
        return arguments.length ? (range = Array.from(_), rescale()) : range.slice();
      };

      scale.rangeRound = function(_) {
        return range = Array.from(_), interpolate$1 = interpolateRound, rescale();
      };

      scale.clamp = function(_) {
        return arguments.length ? (clamp = _ ? true : identity$1, rescale()) : clamp !== identity$1;
      };

      scale.interpolate = function(_) {
        return arguments.length ? (interpolate$1 = _, rescale()) : interpolate$1;
      };

      scale.unknown = function(_) {
        return arguments.length ? (unknown = _, scale) : unknown;
      };

      return function(t, u) {
        transform = t, untransform = u;
        return rescale();
      };
    }

    function continuous() {
      return transformer()(identity$1, identity$1);
    }

    function formatDecimal(x) {
      return Math.abs(x = Math.round(x)) >= 1e21
          ? x.toLocaleString("en").replace(/,/g, "")
          : x.toString(10);
    }

    // Computes the decimal coefficient and exponent of the specified number x with
    // significant digits p, where x is positive and p is in [1, 21] or undefined.
    // For example, formatDecimalParts(1.23) returns ["123", 0].
    function formatDecimalParts(x, p) {
      if ((i = (x = p ? x.toExponential(p - 1) : x.toExponential()).indexOf("e")) < 0) return null; // NaN, ±Infinity
      var i, coefficient = x.slice(0, i);

      // The string returned by toExponential either has the form \d\.\d+e[-+]\d+
      // (e.g., 1.2e+3) or the form \de[-+]\d+ (e.g., 1e+3).
      return [
        coefficient.length > 1 ? coefficient[0] + coefficient.slice(2) : coefficient,
        +x.slice(i + 1)
      ];
    }

    function exponent(x) {
      return x = formatDecimalParts(Math.abs(x)), x ? x[1] : NaN;
    }

    function formatGroup(grouping, thousands) {
      return function(value, width) {
        var i = value.length,
            t = [],
            j = 0,
            g = grouping[0],
            length = 0;

        while (i > 0 && g > 0) {
          if (length + g + 1 > width) g = Math.max(1, width - length);
          t.push(value.substring(i -= g, i + g));
          if ((length += g + 1) > width) break;
          g = grouping[j = (j + 1) % grouping.length];
        }

        return t.reverse().join(thousands);
      };
    }

    function formatNumerals(numerals) {
      return function(value) {
        return value.replace(/[0-9]/g, function(i) {
          return numerals[+i];
        });
      };
    }

    // [[fill]align][sign][symbol][0][width][,][.precision][~][type]
    var re = /^(?:(.)?([<>=^]))?([+\-( ])?([$#])?(0)?(\d+)?(,)?(\.\d+)?(~)?([a-z%])?$/i;

    function formatSpecifier(specifier) {
      if (!(match = re.exec(specifier))) throw new Error("invalid format: " + specifier);
      var match;
      return new FormatSpecifier({
        fill: match[1],
        align: match[2],
        sign: match[3],
        symbol: match[4],
        zero: match[5],
        width: match[6],
        comma: match[7],
        precision: match[8] && match[8].slice(1),
        trim: match[9],
        type: match[10]
      });
    }

    formatSpecifier.prototype = FormatSpecifier.prototype; // instanceof

    function FormatSpecifier(specifier) {
      this.fill = specifier.fill === undefined ? " " : specifier.fill + "";
      this.align = specifier.align === undefined ? ">" : specifier.align + "";
      this.sign = specifier.sign === undefined ? "-" : specifier.sign + "";
      this.symbol = specifier.symbol === undefined ? "" : specifier.symbol + "";
      this.zero = !!specifier.zero;
      this.width = specifier.width === undefined ? undefined : +specifier.width;
      this.comma = !!specifier.comma;
      this.precision = specifier.precision === undefined ? undefined : +specifier.precision;
      this.trim = !!specifier.trim;
      this.type = specifier.type === undefined ? "" : specifier.type + "";
    }

    FormatSpecifier.prototype.toString = function() {
      return this.fill
          + this.align
          + this.sign
          + this.symbol
          + (this.zero ? "0" : "")
          + (this.width === undefined ? "" : Math.max(1, this.width | 0))
          + (this.comma ? "," : "")
          + (this.precision === undefined ? "" : "." + Math.max(0, this.precision | 0))
          + (this.trim ? "~" : "")
          + this.type;
    };

    // Trims insignificant zeros, e.g., replaces 1.2000k with 1.2k.
    function formatTrim(s) {
      out: for (var n = s.length, i = 1, i0 = -1, i1; i < n; ++i) {
        switch (s[i]) {
          case ".": i0 = i1 = i; break;
          case "0": if (i0 === 0) i0 = i; i1 = i; break;
          default: if (!+s[i]) break out; if (i0 > 0) i0 = 0; break;
        }
      }
      return i0 > 0 ? s.slice(0, i0) + s.slice(i1 + 1) : s;
    }

    var prefixExponent;

    function formatPrefixAuto(x, p) {
      var d = formatDecimalParts(x, p);
      if (!d) return x + "";
      var coefficient = d[0],
          exponent = d[1],
          i = exponent - (prefixExponent = Math.max(-8, Math.min(8, Math.floor(exponent / 3))) * 3) + 1,
          n = coefficient.length;
      return i === n ? coefficient
          : i > n ? coefficient + new Array(i - n + 1).join("0")
          : i > 0 ? coefficient.slice(0, i) + "." + coefficient.slice(i)
          : "0." + new Array(1 - i).join("0") + formatDecimalParts(x, Math.max(0, p + i - 1))[0]; // less than 1y!
    }

    function formatRounded(x, p) {
      var d = formatDecimalParts(x, p);
      if (!d) return x + "";
      var coefficient = d[0],
          exponent = d[1];
      return exponent < 0 ? "0." + new Array(-exponent).join("0") + coefficient
          : coefficient.length > exponent + 1 ? coefficient.slice(0, exponent + 1) + "." + coefficient.slice(exponent + 1)
          : coefficient + new Array(exponent - coefficient.length + 2).join("0");
    }

    var formatTypes = {
      "%": (x, p) => (x * 100).toFixed(p),
      "b": (x) => Math.round(x).toString(2),
      "c": (x) => x + "",
      "d": formatDecimal,
      "e": (x, p) => x.toExponential(p),
      "f": (x, p) => x.toFixed(p),
      "g": (x, p) => x.toPrecision(p),
      "o": (x) => Math.round(x).toString(8),
      "p": (x, p) => formatRounded(x * 100, p),
      "r": formatRounded,
      "s": formatPrefixAuto,
      "X": (x) => Math.round(x).toString(16).toUpperCase(),
      "x": (x) => Math.round(x).toString(16)
    };

    function identity$2(x) {
      return x;
    }

    var map = Array.prototype.map,
        prefixes = ["y","z","a","f","p","n","µ","m","","k","M","G","T","P","E","Z","Y"];

    function formatLocale(locale) {
      var group = locale.grouping === undefined || locale.thousands === undefined ? identity$2 : formatGroup(map.call(locale.grouping, Number), locale.thousands + ""),
          currencyPrefix = locale.currency === undefined ? "" : locale.currency[0] + "",
          currencySuffix = locale.currency === undefined ? "" : locale.currency[1] + "",
          decimal = locale.decimal === undefined ? "." : locale.decimal + "",
          numerals = locale.numerals === undefined ? identity$2 : formatNumerals(map.call(locale.numerals, String)),
          percent = locale.percent === undefined ? "%" : locale.percent + "",
          minus = locale.minus === undefined ? "−" : locale.minus + "",
          nan = locale.nan === undefined ? "NaN" : locale.nan + "";

      function newFormat(specifier) {
        specifier = formatSpecifier(specifier);

        var fill = specifier.fill,
            align = specifier.align,
            sign = specifier.sign,
            symbol = specifier.symbol,
            zero = specifier.zero,
            width = specifier.width,
            comma = specifier.comma,
            precision = specifier.precision,
            trim = specifier.trim,
            type = specifier.type;

        // The "n" type is an alias for ",g".
        if (type === "n") comma = true, type = "g";

        // The "" type, and any invalid type, is an alias for ".12~g".
        else if (!formatTypes[type]) precision === undefined && (precision = 12), trim = true, type = "g";

        // If zero fill is specified, padding goes after sign and before digits.
        if (zero || (fill === "0" && align === "=")) zero = true, fill = "0", align = "=";

        // Compute the prefix and suffix.
        // For SI-prefix, the suffix is lazily computed.
        var prefix = symbol === "$" ? currencyPrefix : symbol === "#" && /[boxX]/.test(type) ? "0" + type.toLowerCase() : "",
            suffix = symbol === "$" ? currencySuffix : /[%p]/.test(type) ? percent : "";

        // What format function should we use?
        // Is this an integer type?
        // Can this type generate exponential notation?
        var formatType = formatTypes[type],
            maybeSuffix = /[defgprs%]/.test(type);

        // Set the default precision if not specified,
        // or clamp the specified precision to the supported range.
        // For significant precision, it must be in [1, 21].
        // For fixed precision, it must be in [0, 20].
        precision = precision === undefined ? 6
            : /[gprs]/.test(type) ? Math.max(1, Math.min(21, precision))
            : Math.max(0, Math.min(20, precision));

        function format(value) {
          var valuePrefix = prefix,
              valueSuffix = suffix,
              i, n, c;

          if (type === "c") {
            valueSuffix = formatType(value) + valueSuffix;
            value = "";
          } else {
            value = +value;

            // Determine the sign. -0 is not less than 0, but 1 / -0 is!
            var valueNegative = value < 0 || 1 / value < 0;

            // Perform the initial formatting.
            value = isNaN(value) ? nan : formatType(Math.abs(value), precision);

            // Trim insignificant zeros.
            if (trim) value = formatTrim(value);

            // If a negative value rounds to zero after formatting, and no explicit positive sign is requested, hide the sign.
            if (valueNegative && +value === 0 && sign !== "+") valueNegative = false;

            // Compute the prefix and suffix.
            valuePrefix = (valueNegative ? (sign === "(" ? sign : minus) : sign === "-" || sign === "(" ? "" : sign) + valuePrefix;
            valueSuffix = (type === "s" ? prefixes[8 + prefixExponent / 3] : "") + valueSuffix + (valueNegative && sign === "(" ? ")" : "");

            // Break the formatted value into the integer “value” part that can be
            // grouped, and fractional or exponential “suffix” part that is not.
            if (maybeSuffix) {
              i = -1, n = value.length;
              while (++i < n) {
                if (c = value.charCodeAt(i), 48 > c || c > 57) {
                  valueSuffix = (c === 46 ? decimal + value.slice(i + 1) : value.slice(i)) + valueSuffix;
                  value = value.slice(0, i);
                  break;
                }
              }
            }
          }

          // If the fill character is not "0", grouping is applied before padding.
          if (comma && !zero) value = group(value, Infinity);

          // Compute the padding.
          var length = valuePrefix.length + value.length + valueSuffix.length,
              padding = length < width ? new Array(width - length + 1).join(fill) : "";

          // If the fill character is "0", grouping is applied after padding.
          if (comma && zero) value = group(padding + value, padding.length ? width - valueSuffix.length : Infinity), padding = "";

          // Reconstruct the final output based on the desired alignment.
          switch (align) {
            case "<": value = valuePrefix + value + valueSuffix + padding; break;
            case "=": value = valuePrefix + padding + value + valueSuffix; break;
            case "^": value = padding.slice(0, length = padding.length >> 1) + valuePrefix + value + valueSuffix + padding.slice(length); break;
            default: value = padding + valuePrefix + value + valueSuffix; break;
          }

          return numerals(value);
        }

        format.toString = function() {
          return specifier + "";
        };

        return format;
      }

      function formatPrefix(specifier, value) {
        var f = newFormat((specifier = formatSpecifier(specifier), specifier.type = "f", specifier)),
            e = Math.max(-8, Math.min(8, Math.floor(exponent(value) / 3))) * 3,
            k = Math.pow(10, -e),
            prefix = prefixes[8 + e / 3];
        return function(value) {
          return f(k * value) + prefix;
        };
      }

      return {
        format: newFormat,
        formatPrefix: formatPrefix
      };
    }

    var locale;
    var format;
    var formatPrefix;

    defaultLocale({
      thousands: ",",
      grouping: [3],
      currency: ["$", ""]
    });

    function defaultLocale(definition) {
      locale = formatLocale(definition);
      format = locale.format;
      formatPrefix = locale.formatPrefix;
      return locale;
    }

    function precisionFixed(step) {
      return Math.max(0, -exponent(Math.abs(step)));
    }

    function precisionPrefix(step, value) {
      return Math.max(0, Math.max(-8, Math.min(8, Math.floor(exponent(value) / 3))) * 3 - exponent(Math.abs(step)));
    }

    function precisionRound(step, max) {
      step = Math.abs(step), max = Math.abs(max) - step;
      return Math.max(0, exponent(max) - exponent(step)) + 1;
    }

    function tickFormat(start, stop, count, specifier) {
      var step = tickStep(start, stop, count),
          precision;
      specifier = formatSpecifier(specifier == null ? ",f" : specifier);
      switch (specifier.type) {
        case "s": {
          var value = Math.max(Math.abs(start), Math.abs(stop));
          if (specifier.precision == null && !isNaN(precision = precisionPrefix(step, value))) specifier.precision = precision;
          return formatPrefix(specifier, value);
        }
        case "":
        case "e":
        case "g":
        case "p":
        case "r": {
          if (specifier.precision == null && !isNaN(precision = precisionRound(step, Math.max(Math.abs(start), Math.abs(stop))))) specifier.precision = precision - (specifier.type === "e");
          break;
        }
        case "f":
        case "%": {
          if (specifier.precision == null && !isNaN(precision = precisionFixed(step))) specifier.precision = precision - (specifier.type === "%") * 2;
          break;
        }
      }
      return format(specifier);
    }

    function linearish(scale) {
      var domain = scale.domain;

      scale.ticks = function(count) {
        var d = domain();
        return ticks(d[0], d[d.length - 1], count == null ? 10 : count);
      };

      scale.tickFormat = function(count, specifier) {
        var d = domain();
        return tickFormat(d[0], d[d.length - 1], count == null ? 10 : count, specifier);
      };

      scale.nice = function(count) {
        if (count == null) count = 10;

        var d = domain();
        var i0 = 0;
        var i1 = d.length - 1;
        var start = d[i0];
        var stop = d[i1];
        var prestep;
        var step;
        var maxIter = 10;

        if (stop < start) {
          step = start, start = stop, stop = step;
          step = i0, i0 = i1, i1 = step;
        }
        
        while (maxIter-- > 0) {
          step = tickIncrement(start, stop, count);
          if (step === prestep) {
            d[i0] = start;
            d[i1] = stop;
            return domain(d);
          } else if (step > 0) {
            start = Math.floor(start / step) * step;
            stop = Math.ceil(stop / step) * step;
          } else if (step < 0) {
            start = Math.ceil(start * step) / step;
            stop = Math.floor(stop * step) / step;
          } else {
            break;
          }
          prestep = step;
        }

        return scale;
      };

      return scale;
    }

    function linear$1() {
      var scale = continuous();

      scale.copy = function() {
        return copy(scale, linear$1());
      };

      initRange.apply(scale, arguments);

      return linearish(scale);
    }

    function transformPow(exponent) {
      return function(x) {
        return x < 0 ? -Math.pow(-x, exponent) : Math.pow(x, exponent);
      };
    }

    function transformSqrt(x) {
      return x < 0 ? -Math.sqrt(-x) : Math.sqrt(x);
    }

    function transformSquare(x) {
      return x < 0 ? -x * x : x * x;
    }

    function powish(transform) {
      var scale = transform(identity$1, identity$1),
          exponent = 1;

      function rescale() {
        return exponent === 1 ? transform(identity$1, identity$1)
            : exponent === 0.5 ? transform(transformSqrt, transformSquare)
            : transform(transformPow(exponent), transformPow(1 / exponent));
      }

      scale.exponent = function(_) {
        return arguments.length ? (exponent = +_, rescale()) : exponent;
      };

      return linearish(scale);
    }

    function pow() {
      var scale = powish(transformer());

      scale.copy = function() {
        return copy(scale, pow()).exponent(scale.exponent());
      };

      initRange.apply(scale, arguments);

      return scale;
    }

    function sqrt() {
      return pow.apply(null, arguments).exponent(0.5);
    }

    var defaultScales = {
    	x: linear$1,
    	y: linear$1,
    	z: linear$1,
    	r: sqrt
    };

    /* --------------------------------------------
     *
     * Determine whether a scale is a log, symlog, power or other
     * This is not meant to be exhaustive of all the different types of
     * scales in d3-scale and focuses on continuous scales
     *
     * --------------------------------------------
     */
    function findScaleType(scale) {
    	if (scale.constant) {
    		return 'symlog';
    	}
    	if (scale.base) {
    		return 'log';
    	}
    	if (scale.exponent) {
    		if (scale.exponent() === 0.5) {
    			return 'sqrt';
    		}
    		return 'pow';
    	}
    	return 'other';
    }

    function identity$3 (d) {
    	return d;
    }

    function log(sign) {
    	return x => Math.log(sign * x);
    }

    function exp(sign) {
    	return x => sign * Math.exp(x);
    }

    function symlog(c) {
    	return x => Math.sign(x) * Math.log1p(Math.abs(x / c));
    }

    function symexp(c) {
    	return x => Math.sign(x) * Math.expm1(Math.abs(x)) * c;
    }

    function pow$1(exponent) {
    	return function powFn(x) {
    		return x < 0 ? -Math.pow(-x, exponent) : Math.pow(x, exponent);
    	};
    }

    function getPadFunctions(scale) {
    	const scaleType = findScaleType(scale);

    	if (scaleType === 'log') {
    		const sign = Math.sign(scale.domain()[0]);
    		return { lift: log(sign), ground: exp(sign), scaleType };
    	}
    	if (scaleType === 'pow') {
    		const exponent = 1;
    		return { lift: pow$1(exponent), ground: pow$1(1 / exponent), scaleType };
    	}
    	if (scaleType === 'sqrt') {
    		const exponent = 0.5;
    		return { lift: pow$1(exponent), ground: pow$1(1 / exponent), scaleType };
    	}
    	if (scaleType === 'symlog') {
    		const constant = 1;
    		return { lift: symlog(constant), ground: symexp(constant), scaleType };
    	}

    	return { lift: identity$3, ground: identity$3, scaleType };
    }

    /* --------------------------------------------
     *
     * Returns a modified scale domain by in/decreasing
     * the min/max by taking the desired difference
     * in pixels and converting it to units of data.
     * Returns an array that you can set as the new domain.
     * Padding contributed by @veltman.
     * See here for discussion of transforms: https://github.com/d3/d3-scale/issues/150
     *
     * --------------------------------------------
     */

    function padScale (scale, padding) {
    	if (typeof scale.range !== 'function') {
    		throw new Error('Scale method `range` must be a function');
    	}
    	if (typeof scale.domain !== 'function') {
    		throw new Error('Scale method `domain` must be a function');
    	}
    	if (!Array.isArray(padding)) {
    		return scale.domain();
    	}

    	if (scale.domain().length !== 2) {
    		console.warn('[LayerCake] The scale is expected to have a domain of length 2 to use padding. Are you sure you want to use padding? Your scale\'s domain is:', scale.domain());
    	}
    	if (scale.range().length !== 2) {
    		console.warn('[LayerCake] The scale is expected to have a range of length 2 to use padding. Are you sure you want to use padding? Your scale\'s range is:', scale.range());
    	}

    	const { lift, ground } = getPadFunctions(scale);

    	const d0 = scale.domain()[0];

    	const isTime = Object.prototype.toString.call(d0) === '[object Date]';

    	const [d1, d2] = scale.domain().map(d => {
    		return isTime ? lift(d.getTime()) : lift(d);
    	});
    	const [r1, r2] = scale.range();
    	const paddingLeft = padding[0] || 0;
    	const paddingRight = padding[1] || 0;

    	const step = (d2 - d1) / (Math.abs(r2 - r1) - paddingLeft - paddingRight); // Math.abs() to properly handle reversed scales

    	return [d1 - paddingLeft * step, paddingRight * step + d2].map(d => {
    		return isTime ? ground(new Date(d)) : ground(d);
    	});
    }

    /* eslint-disable no-nested-ternary */
    function calcBaseRange(s, width, height, reverse, percentRange) {
    	let min;
    	let max;
    	if (percentRange === true) {
    		min = 0;
    		max = 100;
    	} else {
    		min = s === 'r' ? 1 : 0;
    		max = s === 'y' ? height : s === 'r' ? 25 : width;
    	}
    	return reverse === true ? [max, min] : [min, max];
    }

    function getDefaultRange(s, width, height, reverse, range, percentRange) {
    	return !range
    		? calcBaseRange(s, width, height, reverse, percentRange)
    		: typeof range === 'function'
    			? range({ width, height })
    			: range;
    }

    function createScale (s) {
    	return function scaleCreator ([$scale, $extents, $domain, $padding, $nice, $reverse, $width, $height, $range, $percentScale]) {
    		if ($extents === null) {
    			return null;
    		}

    		const defaultRange = getDefaultRange(s, $width, $height, $reverse, $range, $percentScale);

    		const scale = $scale === defaultScales[s] ? $scale() : $scale.copy();

    		/* --------------------------------------------
    		 * On creation, `$domain` will already have any nulls filled in
    		 * But if we set it via the context it might not, so rerun it through partialDomain
    		 */
    		scale
    			.domain(partialDomain($extents[s], $domain))
    			.range(defaultRange);

    		if ($padding) {
    			scale.domain(padScale(scale, $padding));
    		}

    		if ($nice === true) {
    			if (typeof scale.nice === 'function') {
    				scale.nice();
    			} else {
    				console.error(`[Layer Cake] You set \`${s}Nice: true\` but the ${s}Scale does not have a \`.nice\` method. Ignoring...`);
    			}
    		}

    		return scale;
    	};
    }

    function createGetter ([$acc, $scale]) {
    	return d => {
    		const val = $acc(d);
    		if (Array.isArray(val)) {
    			return val.map(v => $scale(v));
    		}
    		return $scale(val);
    	};
    }

    function getRange([$scale]) {
    	if (typeof $scale === 'function') {
    		if (typeof $scale.range === 'function') {
    			return $scale.range();
    		}
    		console.error('[LayerCake] Your scale doesn\'t have a `.range` method?');
    	}
    	return null;
    }

    var defaultReverses = {
    	x: false,
    	y: true,
    	z: false,
    	r: false
    };

    /* node_modules/layercake/src/LayerCake.svelte generated by Svelte v3.23.2 */

    const { Object: Object_1, console: console_1 } = globals;
    const file = "node_modules/layercake/src/LayerCake.svelte";

    const get_default_slot_changes = dirty => ({
    	width: dirty[0] & /*$width_d*/ 32,
    	height: dirty[0] & /*$height_d*/ 64,
    	aspectRatio: dirty[0] & /*$aspectRatio_d*/ 128,
    	containerWidth: dirty[0] & /*$_containerWidth*/ 256,
    	containerHeight: dirty[0] & /*$_containerHeight*/ 512
    });

    const get_default_slot_context = ctx => ({
    	width: /*$width_d*/ ctx[5],
    	height: /*$height_d*/ ctx[6],
    	aspectRatio: /*$aspectRatio_d*/ ctx[7],
    	containerWidth: /*$_containerWidth*/ ctx[8],
    	containerHeight: /*$_containerHeight*/ ctx[9]
    });

    // (294:0) {#if (ssr === true || typeof window !== 'undefined')}
    function create_if_block(ctx) {
    	let div;
    	let div_style_value;
    	let div_resize_listener;
    	let current;
    	const default_slot_template = /*$$slots*/ ctx[52].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[51], get_default_slot_context);

    	const block = {
    		c: function create() {
    			div = element("div");
    			if (default_slot) default_slot.c();
    			attr_dev(div, "class", "layercake-container svelte-vhzpsp");

    			attr_dev(div, "style", div_style_value = "\n\t\t\tposition:" + /*position*/ ctx[4] + ";\n\t\t\t" + (/*position*/ ctx[4] === "absolute"
    			? "top:0;right:0;bottom:0;left:0;"
    			: "") + "\n\t\t\t" + (/*pointerEvents*/ ctx[3] === false
    			? "pointer-events:none;"
    			: "") + "\n\t\t");

    			add_render_callback(() => /*div_elementresize_handler*/ ctx[53].call(div));
    			add_location(div, file, 294, 1, 9534);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);

    			if (default_slot) {
    				default_slot.m(div, null);
    			}

    			div_resize_listener = add_resize_listener(div, /*div_elementresize_handler*/ ctx[53].bind(div));
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (default_slot) {
    				if (default_slot.p && dirty[0] & /*$width_d, $height_d, $aspectRatio_d, $_containerWidth, $_containerHeight*/ 992 | dirty[1] & /*$$scope*/ 1048576) {
    					update_slot(default_slot, default_slot_template, ctx, /*$$scope*/ ctx[51], dirty, get_default_slot_changes, get_default_slot_context);
    				}
    			}

    			if (!current || dirty[0] & /*position, pointerEvents*/ 24 && div_style_value !== (div_style_value = "\n\t\t\tposition:" + /*position*/ ctx[4] + ";\n\t\t\t" + (/*position*/ ctx[4] === "absolute"
    			? "top:0;right:0;bottom:0;left:0;"
    			: "") + "\n\t\t\t" + (/*pointerEvents*/ ctx[3] === false
    			? "pointer-events:none;"
    			: "") + "\n\t\t")) {
    				attr_dev(div, "style", div_style_value);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (default_slot) default_slot.d(detaching);
    			div_resize_listener();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block.name,
    		type: "if",
    		source: "(294:0) {#if (ssr === true || typeof window !== 'undefined')}",
    		ctx
    	});

    	return block;
    }

    function create_fragment(ctx) {
    	let if_block_anchor;
    	let current;
    	let if_block = (/*ssr*/ ctx[2] === true || typeof window !== "undefined") && create_if_block(ctx);

    	const block = {
    		c: function create() {
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (/*ssr*/ ctx[2] === true || typeof window !== "undefined") {
    				if (if_block) {
    					if_block.p(ctx, dirty);

    					if (dirty[0] & /*ssr*/ 4) {
    						transition_in(if_block, 1);
    					}
    				} else {
    					if_block = create_if_block(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			} else if (if_block) {
    				group_outros();

    				transition_out(if_block, 1, 1, () => {
    					if_block = null;
    				});

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance($$self, $$props, $$invalidate) {
    	let $width_d;
    	let $height_d;
    	let $aspectRatio_d;
    	let $_containerWidth;
    	let $_containerHeight;
    	let { ssr = false } = $$props;
    	let { pointerEvents = true } = $$props;
    	let { position = "relative" } = $$props;
    	let { percentRange = false } = $$props;
    	let { width = undefined } = $$props;
    	let { height = undefined } = $$props;
    	let { containerWidth = width || 100 } = $$props;
    	let { containerHeight = height || 100 } = $$props;
    	let { x = undefined } = $$props;
    	let { y = undefined } = $$props;
    	let { z = undefined } = $$props;
    	let { r = undefined } = $$props;
    	let { custom = {} } = $$props;
    	let { data = [] } = $$props;
    	let { xDomain = undefined } = $$props;
    	let { yDomain = undefined } = $$props;
    	let { zDomain = undefined } = $$props;
    	let { rDomain = undefined } = $$props;
    	let { xNice = false } = $$props;
    	let { yNice = false } = $$props;
    	let { zNice = false } = $$props;
    	let { rNice = false } = $$props;
    	let { xReverse = defaultReverses.x } = $$props;
    	let { yReverse = defaultReverses.y } = $$props;
    	let { zReverse = defaultReverses.z } = $$props;
    	let { rReverse = defaultReverses.r } = $$props;
    	let { xPadding = undefined } = $$props;
    	let { yPadding = undefined } = $$props;
    	let { zPadding = undefined } = $$props;
    	let { rPadding = undefined } = $$props;
    	let { xScale = defaultScales.x } = $$props;
    	let { yScale = defaultScales.y } = $$props;
    	let { zScale = defaultScales.y } = $$props;
    	let { rScale = defaultScales.r } = $$props;
    	let { xRange = undefined } = $$props;
    	let { yRange = undefined } = $$props;
    	let { zRange = undefined } = $$props;
    	let { rRange = undefined } = $$props;
    	let { padding = {} } = $$props;
    	let { extents = {} } = $$props;
    	let { flatData = undefined } = $$props;

    	/* --------------------------------------------
     * Preserve a copy of our passed in settings before we modify them
     * Return this to the user's context so they can reference things if need be
     * Add the active keys since those aren't on our settings object.
     * This is mostly an escape-hatch
     */
    	const config = {};

    	/* --------------------------------------------
     * Make store versions of each parameter
     * Prefix these with `_` to keep things organized
     */
    	const _percentRange = writable();

    	const _containerWidth = writable();
    	validate_store(_containerWidth, "_containerWidth");
    	component_subscribe($$self, _containerWidth, value => $$invalidate(8, $_containerWidth = value));
    	const _containerHeight = writable();
    	validate_store(_containerHeight, "_containerHeight");
    	component_subscribe($$self, _containerHeight, value => $$invalidate(9, $_containerHeight = value));
    	const _x = writable();
    	const _y = writable();
    	const _z = writable();
    	const _r = writable();
    	const _custom = writable();
    	const _data = writable();
    	const _xDomain = writable();
    	const _yDomain = writable();
    	const _zDomain = writable();
    	const _rDomain = writable();
    	const _xNice = writable();
    	const _yNice = writable();
    	const _zNice = writable();
    	const _rNice = writable();
    	const _xReverse = writable();
    	const _yReverse = writable();
    	const _zReverse = writable();
    	const _rReverse = writable();
    	const _xPadding = writable();
    	const _yPadding = writable();
    	const _zPadding = writable();
    	const _rPadding = writable();
    	const _xScale = writable();
    	const _yScale = writable();
    	const _zScale = writable();
    	const _rScale = writable();
    	const _xRange = writable();
    	const _yRange = writable();
    	const _zRange = writable();
    	const _rRange = writable();
    	const _padding = writable();
    	const _flatData = writable();
    	const _extents = writable();
    	const _config = writable(config);

    	/* --------------------------------------------
     * Create derived values
     * Suffix these with `_d`
     */
    	const activeGetters_d = derived([_x, _y, _z, _r], ([$x, $y, $z, $r]) => {
    		return [
    			{ field: "x", accessor: $x },
    			{ field: "y", accessor: $y },
    			{ field: "z", accessor: $z },
    			{ field: "r", accessor: $r }
    		].filter(d => d.accessor);
    	});

    	const padding_d = derived([_padding, _containerWidth, _containerHeight], ([$padding]) => {
    		const defaultPadding = { top: 0, right: 0, bottom: 0, left: 0 };
    		return Object.assign(defaultPadding, $padding);
    	});

    	const box_d = derived([_containerWidth, _containerHeight, padding_d], ([$containerWidth, $containerHeight, $padding]) => {
    		const b = {};
    		b.top = $padding.top;
    		b.right = $containerWidth - $padding.right;
    		b.bottom = $containerHeight - $padding.bottom;
    		b.left = $padding.left;
    		b.width = b.right - b.left;
    		b.height = b.bottom - b.top;

    		if (b.width < 0 && b.height < 0) {
    			console.error("[LayerCake] Target div has negative width and height. Did you forget to set a width or height on the container?");
    		} else if (b.width < 0) {
    			console.error("[LayerCake] Target div has a negative width. Did you forget to set that CSS on the container?");
    		} else if (b.height < 0) {
    			console.error("[LayerCake] Target div has negative height. Did you forget to set that CSS on the container?");
    		}

    		return b;
    	});

    	const width_d = derived([box_d], ([$box]) => {
    		return $box.width;
    	});

    	validate_store(width_d, "width_d");
    	component_subscribe($$self, width_d, value => $$invalidate(5, $width_d = value));

    	const height_d = derived([box_d], ([$box]) => {
    		return $box.height;
    	});

    	validate_store(height_d, "height_d");
    	component_subscribe($$self, height_d, value => $$invalidate(6, $height_d = value));

    	/* --------------------------------------------
     * Calculate extents by taking the extent of the data
     * and filling that in with anything set by the user
     */
    	const extents_d = derived([_flatData, activeGetters_d, _extents], ([$flatData, $activeGetters, $extents]) => {
    		return {
    			...calcExtents($flatData, $activeGetters.filter(d => !$extents[d.field])),
    			...$extents
    		};
    	});

    	const xDomain_d = derived([extents_d, _xDomain], calcDomain("x"));
    	const yDomain_d = derived([extents_d, _yDomain], calcDomain("y"));
    	const zDomain_d = derived([extents_d, _zDomain], calcDomain("z"));
    	const rDomain_d = derived([extents_d, _rDomain], calcDomain("r"));

    	const xScale_d = derived(
    		[
    			_xScale,
    			extents_d,
    			xDomain_d,
    			_xPadding,
    			_xNice,
    			_xReverse,
    			width_d,
    			height_d,
    			_xRange,
    			_percentRange
    		],
    		createScale("x")
    	);

    	const xGet_d = derived([_x, xScale_d], createGetter);

    	const yScale_d = derived(
    		[
    			_yScale,
    			extents_d,
    			yDomain_d,
    			_yPadding,
    			_yNice,
    			_yReverse,
    			width_d,
    			height_d,
    			_yRange,
    			_percentRange
    		],
    		createScale("y")
    	);

    	const yGet_d = derived([_y, yScale_d], createGetter);

    	const zScale_d = derived(
    		[
    			_zScale,
    			extents_d,
    			zDomain_d,
    			_zPadding,
    			_zNice,
    			_zReverse,
    			width_d,
    			height_d,
    			_zRange,
    			_percentRange
    		],
    		createScale("z")
    	);

    	const zGet_d = derived([_z, zScale_d], createGetter);

    	const rScale_d = derived(
    		[
    			_rScale,
    			extents_d,
    			rDomain_d,
    			_rPadding,
    			_rNice,
    			_rReverse,
    			width_d,
    			height_d,
    			_rRange,
    			_percentRange
    		],
    		createScale("r")
    	);

    	const rGet_d = derived([_r, rScale_d], createGetter);
    	const xRange_d = derived([xScale_d], getRange);
    	const yRange_d = derived([yScale_d], getRange);
    	const zRange_d = derived([zScale_d], getRange);
    	const rRange_d = derived([rScale_d], getRange);

    	const aspectRatio_d = derived([width_d, height_d], ([$aspectRatio, $width, $height]) => {
    		return $width / $height;
    	});

    	validate_store(aspectRatio_d, "aspectRatio_d");
    	component_subscribe($$self, aspectRatio_d, value => $$invalidate(7, $aspectRatio_d = value));

    	const writable_props = [
    		"ssr",
    		"pointerEvents",
    		"position",
    		"percentRange",
    		"width",
    		"height",
    		"containerWidth",
    		"containerHeight",
    		"x",
    		"y",
    		"z",
    		"r",
    		"custom",
    		"data",
    		"xDomain",
    		"yDomain",
    		"zDomain",
    		"rDomain",
    		"xNice",
    		"yNice",
    		"zNice",
    		"rNice",
    		"xReverse",
    		"yReverse",
    		"zReverse",
    		"rReverse",
    		"xPadding",
    		"yPadding",
    		"zPadding",
    		"rPadding",
    		"xScale",
    		"yScale",
    		"zScale",
    		"rScale",
    		"xRange",
    		"yRange",
    		"zRange",
    		"rRange",
    		"padding",
    		"extents",
    		"flatData"
    	];

    	Object_1.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console_1.warn(`<LayerCake> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("LayerCake", $$slots, ['default']);

    	function div_elementresize_handler() {
    		containerWidth = this.clientWidth;
    		containerHeight = this.clientHeight;
    		$$invalidate(0, containerWidth);
    		$$invalidate(1, containerHeight);
    	}

    	$$self.$set = $$props => {
    		if ("ssr" in $$props) $$invalidate(2, ssr = $$props.ssr);
    		if ("pointerEvents" in $$props) $$invalidate(3, pointerEvents = $$props.pointerEvents);
    		if ("position" in $$props) $$invalidate(4, position = $$props.position);
    		if ("percentRange" in $$props) $$invalidate(15, percentRange = $$props.percentRange);
    		if ("width" in $$props) $$invalidate(16, width = $$props.width);
    		if ("height" in $$props) $$invalidate(17, height = $$props.height);
    		if ("containerWidth" in $$props) $$invalidate(0, containerWidth = $$props.containerWidth);
    		if ("containerHeight" in $$props) $$invalidate(1, containerHeight = $$props.containerHeight);
    		if ("x" in $$props) $$invalidate(18, x = $$props.x);
    		if ("y" in $$props) $$invalidate(19, y = $$props.y);
    		if ("z" in $$props) $$invalidate(20, z = $$props.z);
    		if ("r" in $$props) $$invalidate(21, r = $$props.r);
    		if ("custom" in $$props) $$invalidate(22, custom = $$props.custom);
    		if ("data" in $$props) $$invalidate(23, data = $$props.data);
    		if ("xDomain" in $$props) $$invalidate(24, xDomain = $$props.xDomain);
    		if ("yDomain" in $$props) $$invalidate(25, yDomain = $$props.yDomain);
    		if ("zDomain" in $$props) $$invalidate(26, zDomain = $$props.zDomain);
    		if ("rDomain" in $$props) $$invalidate(27, rDomain = $$props.rDomain);
    		if ("xNice" in $$props) $$invalidate(28, xNice = $$props.xNice);
    		if ("yNice" in $$props) $$invalidate(29, yNice = $$props.yNice);
    		if ("zNice" in $$props) $$invalidate(30, zNice = $$props.zNice);
    		if ("rNice" in $$props) $$invalidate(31, rNice = $$props.rNice);
    		if ("xReverse" in $$props) $$invalidate(32, xReverse = $$props.xReverse);
    		if ("yReverse" in $$props) $$invalidate(33, yReverse = $$props.yReverse);
    		if ("zReverse" in $$props) $$invalidate(34, zReverse = $$props.zReverse);
    		if ("rReverse" in $$props) $$invalidate(35, rReverse = $$props.rReverse);
    		if ("xPadding" in $$props) $$invalidate(36, xPadding = $$props.xPadding);
    		if ("yPadding" in $$props) $$invalidate(37, yPadding = $$props.yPadding);
    		if ("zPadding" in $$props) $$invalidate(38, zPadding = $$props.zPadding);
    		if ("rPadding" in $$props) $$invalidate(39, rPadding = $$props.rPadding);
    		if ("xScale" in $$props) $$invalidate(40, xScale = $$props.xScale);
    		if ("yScale" in $$props) $$invalidate(41, yScale = $$props.yScale);
    		if ("zScale" in $$props) $$invalidate(42, zScale = $$props.zScale);
    		if ("rScale" in $$props) $$invalidate(43, rScale = $$props.rScale);
    		if ("xRange" in $$props) $$invalidate(44, xRange = $$props.xRange);
    		if ("yRange" in $$props) $$invalidate(45, yRange = $$props.yRange);
    		if ("zRange" in $$props) $$invalidate(46, zRange = $$props.zRange);
    		if ("rRange" in $$props) $$invalidate(47, rRange = $$props.rRange);
    		if ("padding" in $$props) $$invalidate(48, padding = $$props.padding);
    		if ("extents" in $$props) $$invalidate(49, extents = $$props.extents);
    		if ("flatData" in $$props) $$invalidate(50, flatData = $$props.flatData);
    		if ("$$scope" in $$props) $$invalidate(51, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		setContext,
    		writable,
    		derived,
    		makeAccessor,
    		filterObject,
    		calcExtents,
    		calcDomain,
    		createScale,
    		createGetter,
    		getRange,
    		defaultScales,
    		defaultReverses,
    		ssr,
    		pointerEvents,
    		position,
    		percentRange,
    		width,
    		height,
    		containerWidth,
    		containerHeight,
    		x,
    		y,
    		z,
    		r,
    		custom,
    		data,
    		xDomain,
    		yDomain,
    		zDomain,
    		rDomain,
    		xNice,
    		yNice,
    		zNice,
    		rNice,
    		xReverse,
    		yReverse,
    		zReverse,
    		rReverse,
    		xPadding,
    		yPadding,
    		zPadding,
    		rPadding,
    		xScale,
    		yScale,
    		zScale,
    		rScale,
    		xRange,
    		yRange,
    		zRange,
    		rRange,
    		padding,
    		extents,
    		flatData,
    		config,
    		_percentRange,
    		_containerWidth,
    		_containerHeight,
    		_x,
    		_y,
    		_z,
    		_r,
    		_custom,
    		_data,
    		_xDomain,
    		_yDomain,
    		_zDomain,
    		_rDomain,
    		_xNice,
    		_yNice,
    		_zNice,
    		_rNice,
    		_xReverse,
    		_yReverse,
    		_zReverse,
    		_rReverse,
    		_xPadding,
    		_yPadding,
    		_zPadding,
    		_rPadding,
    		_xScale,
    		_yScale,
    		_zScale,
    		_rScale,
    		_xRange,
    		_yRange,
    		_zRange,
    		_rRange,
    		_padding,
    		_flatData,
    		_extents,
    		_config,
    		activeGetters_d,
    		padding_d,
    		box_d,
    		width_d,
    		height_d,
    		extents_d,
    		xDomain_d,
    		yDomain_d,
    		zDomain_d,
    		rDomain_d,
    		xScale_d,
    		xGet_d,
    		yScale_d,
    		yGet_d,
    		zScale_d,
    		zGet_d,
    		rScale_d,
    		rGet_d,
    		xRange_d,
    		yRange_d,
    		zRange_d,
    		rRange_d,
    		aspectRatio_d,
    		context,
    		$width_d,
    		$height_d,
    		$aspectRatio_d,
    		$_containerWidth,
    		$_containerHeight
    	});

    	$$self.$inject_state = $$props => {
    		if ("ssr" in $$props) $$invalidate(2, ssr = $$props.ssr);
    		if ("pointerEvents" in $$props) $$invalidate(3, pointerEvents = $$props.pointerEvents);
    		if ("position" in $$props) $$invalidate(4, position = $$props.position);
    		if ("percentRange" in $$props) $$invalidate(15, percentRange = $$props.percentRange);
    		if ("width" in $$props) $$invalidate(16, width = $$props.width);
    		if ("height" in $$props) $$invalidate(17, height = $$props.height);
    		if ("containerWidth" in $$props) $$invalidate(0, containerWidth = $$props.containerWidth);
    		if ("containerHeight" in $$props) $$invalidate(1, containerHeight = $$props.containerHeight);
    		if ("x" in $$props) $$invalidate(18, x = $$props.x);
    		if ("y" in $$props) $$invalidate(19, y = $$props.y);
    		if ("z" in $$props) $$invalidate(20, z = $$props.z);
    		if ("r" in $$props) $$invalidate(21, r = $$props.r);
    		if ("custom" in $$props) $$invalidate(22, custom = $$props.custom);
    		if ("data" in $$props) $$invalidate(23, data = $$props.data);
    		if ("xDomain" in $$props) $$invalidate(24, xDomain = $$props.xDomain);
    		if ("yDomain" in $$props) $$invalidate(25, yDomain = $$props.yDomain);
    		if ("zDomain" in $$props) $$invalidate(26, zDomain = $$props.zDomain);
    		if ("rDomain" in $$props) $$invalidate(27, rDomain = $$props.rDomain);
    		if ("xNice" in $$props) $$invalidate(28, xNice = $$props.xNice);
    		if ("yNice" in $$props) $$invalidate(29, yNice = $$props.yNice);
    		if ("zNice" in $$props) $$invalidate(30, zNice = $$props.zNice);
    		if ("rNice" in $$props) $$invalidate(31, rNice = $$props.rNice);
    		if ("xReverse" in $$props) $$invalidate(32, xReverse = $$props.xReverse);
    		if ("yReverse" in $$props) $$invalidate(33, yReverse = $$props.yReverse);
    		if ("zReverse" in $$props) $$invalidate(34, zReverse = $$props.zReverse);
    		if ("rReverse" in $$props) $$invalidate(35, rReverse = $$props.rReverse);
    		if ("xPadding" in $$props) $$invalidate(36, xPadding = $$props.xPadding);
    		if ("yPadding" in $$props) $$invalidate(37, yPadding = $$props.yPadding);
    		if ("zPadding" in $$props) $$invalidate(38, zPadding = $$props.zPadding);
    		if ("rPadding" in $$props) $$invalidate(39, rPadding = $$props.rPadding);
    		if ("xScale" in $$props) $$invalidate(40, xScale = $$props.xScale);
    		if ("yScale" in $$props) $$invalidate(41, yScale = $$props.yScale);
    		if ("zScale" in $$props) $$invalidate(42, zScale = $$props.zScale);
    		if ("rScale" in $$props) $$invalidate(43, rScale = $$props.rScale);
    		if ("xRange" in $$props) $$invalidate(44, xRange = $$props.xRange);
    		if ("yRange" in $$props) $$invalidate(45, yRange = $$props.yRange);
    		if ("zRange" in $$props) $$invalidate(46, zRange = $$props.zRange);
    		if ("rRange" in $$props) $$invalidate(47, rRange = $$props.rRange);
    		if ("padding" in $$props) $$invalidate(48, padding = $$props.padding);
    		if ("extents" in $$props) $$invalidate(49, extents = $$props.extents);
    		if ("flatData" in $$props) $$invalidate(50, flatData = $$props.flatData);
    		if ("context" in $$props) $$invalidate(55, context = $$props.context);
    	};

    	let context;

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty[0] & /*x*/ 262144) {
    			 if (x) config.x = x;
    		}

    		if ($$self.$$.dirty[0] & /*y*/ 524288) {
    			 if (y) config.y = y;
    		}

    		if ($$self.$$.dirty[0] & /*z*/ 1048576) {
    			 if (z) config.z = z;
    		}

    		if ($$self.$$.dirty[0] & /*r*/ 2097152) {
    			 if (r) config.r = r;
    		}

    		if ($$self.$$.dirty[0] & /*xDomain*/ 16777216) {
    			 if (xDomain) config.xDomain = xDomain;
    		}

    		if ($$self.$$.dirty[0] & /*yDomain*/ 33554432) {
    			 if (yDomain) config.yDomain = yDomain;
    		}

    		if ($$self.$$.dirty[0] & /*zDomain*/ 67108864) {
    			 if (zDomain) config.zDomain = zDomain;
    		}

    		if ($$self.$$.dirty[0] & /*rDomain*/ 134217728) {
    			 if (rDomain) config.rDomain = rDomain;
    		}

    		if ($$self.$$.dirty[1] & /*xRange*/ 8192) {
    			 if (xRange) config.xRange = xRange;
    		}

    		if ($$self.$$.dirty[1] & /*yRange*/ 16384) {
    			 if (yRange) config.yRange = yRange;
    		}

    		if ($$self.$$.dirty[1] & /*zRange*/ 32768) {
    			 if (zRange) config.zRange = zRange;
    		}

    		if ($$self.$$.dirty[1] & /*rRange*/ 65536) {
    			 if (rRange) config.rRange = rRange;
    		}

    		if ($$self.$$.dirty[0] & /*percentRange*/ 32768) {
    			 _percentRange.set(percentRange);
    		}

    		if ($$self.$$.dirty[0] & /*containerWidth*/ 1) {
    			 _containerWidth.set(containerWidth);
    		}

    		if ($$self.$$.dirty[0] & /*containerHeight*/ 2) {
    			 _containerHeight.set(containerHeight);
    		}

    		if ($$self.$$.dirty[0] & /*x*/ 262144) {
    			 _x.set(makeAccessor(x));
    		}

    		if ($$self.$$.dirty[0] & /*y*/ 524288) {
    			 _y.set(makeAccessor(y));
    		}

    		if ($$self.$$.dirty[0] & /*z*/ 1048576) {
    			 _z.set(makeAccessor(z));
    		}

    		if ($$self.$$.dirty[0] & /*r*/ 2097152) {
    			 _r.set(makeAccessor(r));
    		}

    		if ($$self.$$.dirty[0] & /*xDomain*/ 16777216) {
    			 _xDomain.set(xDomain);
    		}

    		if ($$self.$$.dirty[0] & /*yDomain*/ 33554432) {
    			 _yDomain.set(yDomain);
    		}

    		if ($$self.$$.dirty[0] & /*zDomain*/ 67108864) {
    			 _zDomain.set(zDomain);
    		}

    		if ($$self.$$.dirty[0] & /*rDomain*/ 134217728) {
    			 _rDomain.set(rDomain);
    		}

    		if ($$self.$$.dirty[0] & /*custom*/ 4194304) {
    			 _custom.set(custom);
    		}

    		if ($$self.$$.dirty[0] & /*data*/ 8388608) {
    			 _data.set(data);
    		}

    		if ($$self.$$.dirty[0] & /*xNice*/ 268435456) {
    			 _xNice.set(xNice);
    		}

    		if ($$self.$$.dirty[0] & /*yNice*/ 536870912) {
    			 _yNice.set(yNice);
    		}

    		if ($$self.$$.dirty[0] & /*zNice*/ 1073741824) {
    			 _zNice.set(zNice);
    		}

    		if ($$self.$$.dirty[1] & /*rNice*/ 1) {
    			 _rNice.set(rNice);
    		}

    		if ($$self.$$.dirty[1] & /*xReverse*/ 2) {
    			 _xReverse.set(xReverse);
    		}

    		if ($$self.$$.dirty[1] & /*yReverse*/ 4) {
    			 _yReverse.set(yReverse);
    		}

    		if ($$self.$$.dirty[1] & /*zReverse*/ 8) {
    			 _zReverse.set(zReverse);
    		}

    		if ($$self.$$.dirty[1] & /*rReverse*/ 16) {
    			 _rReverse.set(rReverse);
    		}

    		if ($$self.$$.dirty[1] & /*xPadding*/ 32) {
    			 _xPadding.set(xPadding);
    		}

    		if ($$self.$$.dirty[1] & /*yPadding*/ 64) {
    			 _yPadding.set(yPadding);
    		}

    		if ($$self.$$.dirty[1] & /*zPadding*/ 128) {
    			 _zPadding.set(zPadding);
    		}

    		if ($$self.$$.dirty[1] & /*rPadding*/ 256) {
    			 _rPadding.set(rPadding);
    		}

    		if ($$self.$$.dirty[1] & /*xScale*/ 512) {
    			 _xScale.set(xScale);
    		}

    		if ($$self.$$.dirty[1] & /*yScale*/ 1024) {
    			 _yScale.set(yScale);
    		}

    		if ($$self.$$.dirty[1] & /*zScale*/ 2048) {
    			 _zScale.set(zScale);
    		}

    		if ($$self.$$.dirty[1] & /*rScale*/ 4096) {
    			 _rScale.set(rScale);
    		}

    		if ($$self.$$.dirty[1] & /*xRange*/ 8192) {
    			 _xRange.set(xRange);
    		}

    		if ($$self.$$.dirty[1] & /*yRange*/ 16384) {
    			 _yRange.set(yRange);
    		}

    		if ($$self.$$.dirty[1] & /*zRange*/ 32768) {
    			 _zRange.set(zRange);
    		}

    		if ($$self.$$.dirty[1] & /*rRange*/ 65536) {
    			 _rRange.set(rRange);
    		}

    		if ($$self.$$.dirty[1] & /*padding*/ 131072) {
    			 _padding.set(padding);
    		}

    		if ($$self.$$.dirty[1] & /*extents*/ 262144) {
    			 _extents.set(filterObject(extents));
    		}

    		if ($$self.$$.dirty[0] & /*data*/ 8388608 | $$self.$$.dirty[1] & /*flatData*/ 524288) {
    			 _flatData.set(flatData || data);
    		}

    		if ($$self.$$.dirty[1] & /*context*/ 16777216) {
    			 setContext("LayerCake", context);
    		}
    	};

    	 $$invalidate(55, context = {
    		activeGetters: activeGetters_d,
    		width: width_d,
    		height: height_d,
    		percentRange: _percentRange,
    		aspectRatio: aspectRatio_d,
    		containerWidth: _containerWidth,
    		containerHeight: _containerHeight,
    		x: _x,
    		y: _y,
    		z: _z,
    		r: _r,
    		custom: _custom,
    		data: _data,
    		xNice: _xNice,
    		yNice: _yNice,
    		zNice: _zNice,
    		rNice: _rNice,
    		xReverse: _xReverse,
    		yReverse: _yReverse,
    		zReverse: _zReverse,
    		rReverse: _rReverse,
    		xPadding: _xPadding,
    		yPadding: _yPadding,
    		zPadding: _zPadding,
    		rPadding: _rPadding,
    		padding: padding_d,
    		flatData: _flatData,
    		extents: extents_d,
    		xDomain: xDomain_d,
    		yDomain: yDomain_d,
    		zDomain: zDomain_d,
    		rDomain: rDomain_d,
    		xRange: xRange_d,
    		yRange: yRange_d,
    		zRange: zRange_d,
    		rRange: rRange_d,
    		config: _config,
    		xScale: xScale_d,
    		xGet: xGet_d,
    		yScale: yScale_d,
    		yGet: yGet_d,
    		zScale: zScale_d,
    		zGet: zGet_d,
    		rScale: rScale_d,
    		rGet: rGet_d
    	});

    	return [
    		containerWidth,
    		containerHeight,
    		ssr,
    		pointerEvents,
    		position,
    		$width_d,
    		$height_d,
    		$aspectRatio_d,
    		$_containerWidth,
    		$_containerHeight,
    		_containerWidth,
    		_containerHeight,
    		width_d,
    		height_d,
    		aspectRatio_d,
    		percentRange,
    		width,
    		height,
    		x,
    		y,
    		z,
    		r,
    		custom,
    		data,
    		xDomain,
    		yDomain,
    		zDomain,
    		rDomain,
    		xNice,
    		yNice,
    		zNice,
    		rNice,
    		xReverse,
    		yReverse,
    		zReverse,
    		rReverse,
    		xPadding,
    		yPadding,
    		zPadding,
    		rPadding,
    		xScale,
    		yScale,
    		zScale,
    		rScale,
    		xRange,
    		yRange,
    		zRange,
    		rRange,
    		padding,
    		extents,
    		flatData,
    		$$scope,
    		$$slots,
    		div_elementresize_handler
    	];
    }

    class LayerCake extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(
    			this,
    			options,
    			instance,
    			create_fragment,
    			safe_not_equal,
    			{
    				ssr: 2,
    				pointerEvents: 3,
    				position: 4,
    				percentRange: 15,
    				width: 16,
    				height: 17,
    				containerWidth: 0,
    				containerHeight: 1,
    				x: 18,
    				y: 19,
    				z: 20,
    				r: 21,
    				custom: 22,
    				data: 23,
    				xDomain: 24,
    				yDomain: 25,
    				zDomain: 26,
    				rDomain: 27,
    				xNice: 28,
    				yNice: 29,
    				zNice: 30,
    				rNice: 31,
    				xReverse: 32,
    				yReverse: 33,
    				zReverse: 34,
    				rReverse: 35,
    				xPadding: 36,
    				yPadding: 37,
    				zPadding: 38,
    				rPadding: 39,
    				xScale: 40,
    				yScale: 41,
    				zScale: 42,
    				rScale: 43,
    				xRange: 44,
    				yRange: 45,
    				zRange: 46,
    				rRange: 47,
    				padding: 48,
    				extents: 49,
    				flatData: 50
    			},
    			[-1, -1, -1, -1]
    		);

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "LayerCake",
    			options,
    			id: create_fragment.name
    		});
    	}

    	get ssr() {
    		throw new Error("<LayerCake>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set ssr(value) {
    		throw new Error("<LayerCake>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get pointerEvents() {
    		throw new Error("<LayerCake>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set pointerEvents(value) {
    		throw new Error("<LayerCake>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get position() {
    		throw new Error("<LayerCake>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set position(value) {
    		throw new Error("<LayerCake>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get percentRange() {
    		throw new Error("<LayerCake>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set percentRange(value) {
    		throw new Error("<LayerCake>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get width() {
    		throw new Error("<LayerCake>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set width(value) {
    		throw new Error("<LayerCake>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get height() {
    		throw new Error("<LayerCake>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set height(value) {
    		throw new Error("<LayerCake>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get containerWidth() {
    		throw new Error("<LayerCake>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set containerWidth(value) {
    		throw new Error("<LayerCake>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get containerHeight() {
    		throw new Error("<LayerCake>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set containerHeight(value) {
    		throw new Error("<LayerCake>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get x() {
    		throw new Error("<LayerCake>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set x(value) {
    		throw new Error("<LayerCake>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get y() {
    		throw new Error("<LayerCake>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set y(value) {
    		throw new Error("<LayerCake>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get z() {
    		throw new Error("<LayerCake>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set z(value) {
    		throw new Error("<LayerCake>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get r() {
    		throw new Error("<LayerCake>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set r(value) {
    		throw new Error("<LayerCake>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get custom() {
    		throw new Error("<LayerCake>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set custom(value) {
    		throw new Error("<LayerCake>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get data() {
    		throw new Error("<LayerCake>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set data(value) {
    		throw new Error("<LayerCake>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get xDomain() {
    		throw new Error("<LayerCake>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set xDomain(value) {
    		throw new Error("<LayerCake>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get yDomain() {
    		throw new Error("<LayerCake>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set yDomain(value) {
    		throw new Error("<LayerCake>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get zDomain() {
    		throw new Error("<LayerCake>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set zDomain(value) {
    		throw new Error("<LayerCake>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get rDomain() {
    		throw new Error("<LayerCake>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set rDomain(value) {
    		throw new Error("<LayerCake>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get xNice() {
    		throw new Error("<LayerCake>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set xNice(value) {
    		throw new Error("<LayerCake>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get yNice() {
    		throw new Error("<LayerCake>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set yNice(value) {
    		throw new Error("<LayerCake>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get zNice() {
    		throw new Error("<LayerCake>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set zNice(value) {
    		throw new Error("<LayerCake>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get rNice() {
    		throw new Error("<LayerCake>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set rNice(value) {
    		throw new Error("<LayerCake>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get xReverse() {
    		throw new Error("<LayerCake>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set xReverse(value) {
    		throw new Error("<LayerCake>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get yReverse() {
    		throw new Error("<LayerCake>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set yReverse(value) {
    		throw new Error("<LayerCake>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get zReverse() {
    		throw new Error("<LayerCake>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set zReverse(value) {
    		throw new Error("<LayerCake>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get rReverse() {
    		throw new Error("<LayerCake>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set rReverse(value) {
    		throw new Error("<LayerCake>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get xPadding() {
    		throw new Error("<LayerCake>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set xPadding(value) {
    		throw new Error("<LayerCake>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get yPadding() {
    		throw new Error("<LayerCake>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set yPadding(value) {
    		throw new Error("<LayerCake>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get zPadding() {
    		throw new Error("<LayerCake>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set zPadding(value) {
    		throw new Error("<LayerCake>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get rPadding() {
    		throw new Error("<LayerCake>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set rPadding(value) {
    		throw new Error("<LayerCake>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get xScale() {
    		throw new Error("<LayerCake>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set xScale(value) {
    		throw new Error("<LayerCake>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get yScale() {
    		throw new Error("<LayerCake>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set yScale(value) {
    		throw new Error("<LayerCake>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get zScale() {
    		throw new Error("<LayerCake>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set zScale(value) {
    		throw new Error("<LayerCake>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get rScale() {
    		throw new Error("<LayerCake>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set rScale(value) {
    		throw new Error("<LayerCake>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get xRange() {
    		throw new Error("<LayerCake>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set xRange(value) {
    		throw new Error("<LayerCake>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get yRange() {
    		throw new Error("<LayerCake>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set yRange(value) {
    		throw new Error("<LayerCake>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get zRange() {
    		throw new Error("<LayerCake>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set zRange(value) {
    		throw new Error("<LayerCake>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get rRange() {
    		throw new Error("<LayerCake>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set rRange(value) {
    		throw new Error("<LayerCake>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get padding() {
    		throw new Error("<LayerCake>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set padding(value) {
    		throw new Error("<LayerCake>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get extents() {
    		throw new Error("<LayerCake>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set extents(value) {
    		throw new Error("<LayerCake>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get flatData() {
    		throw new Error("<LayerCake>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set flatData(value) {
    		throw new Error("<LayerCake>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* node_modules/layercake/src/layouts/Html.svelte generated by Svelte v3.23.2 */
    const file$1 = "node_modules/layercake/src/layouts/Html.svelte";

    function create_fragment$1(ctx) {
    	let div;
    	let div_style_value;
    	let current;
    	const default_slot_template = /*$$slots*/ ctx[7].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[6], null);

    	const block = {
    		c: function create() {
    			div = element("div");
    			if (default_slot) default_slot.c();
    			attr_dev(div, "class", "layercake-layout-html svelte-1bu60uu");
    			attr_dev(div, "style", div_style_value = "top: " + /*$padding*/ ctx[2].top + "px; right:" + /*$padding*/ ctx[2].right + "px; bottom:" + /*$padding*/ ctx[2].bottom + "px; left:" + /*$padding*/ ctx[2].left + "px;" + /*zIndexStyle*/ ctx[0] + /*pointerEventsStyle*/ ctx[1]);
    			add_location(div, file$1, 15, 0, 389);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);

    			if (default_slot) {
    				default_slot.m(div, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (default_slot) {
    				if (default_slot.p && dirty & /*$$scope*/ 64) {
    					update_slot(default_slot, default_slot_template, ctx, /*$$scope*/ ctx[6], dirty, null, null);
    				}
    			}

    			if (!current || dirty & /*$padding, zIndexStyle, pointerEventsStyle*/ 7 && div_style_value !== (div_style_value = "top: " + /*$padding*/ ctx[2].top + "px; right:" + /*$padding*/ ctx[2].right + "px; bottom:" + /*$padding*/ ctx[2].bottom + "px; left:" + /*$padding*/ ctx[2].left + "px;" + /*zIndexStyle*/ ctx[0] + /*pointerEventsStyle*/ ctx[1])) {
    				attr_dev(div, "style", div_style_value);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (default_slot) default_slot.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$1.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$1($$self, $$props, $$invalidate) {
    	let $padding;
    	let { zIndex = undefined } = $$props;
    	let { pointerEvents = undefined } = $$props;
    	let zIndexStyle = "";
    	let pointerEventsStyle = "";
    	const { padding } = getContext("LayerCake");
    	validate_store(padding, "padding");
    	component_subscribe($$self, padding, value => $$invalidate(2, $padding = value));
    	const writable_props = ["zIndex", "pointerEvents"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Html> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Html", $$slots, ['default']);

    	$$self.$set = $$props => {
    		if ("zIndex" in $$props) $$invalidate(4, zIndex = $$props.zIndex);
    		if ("pointerEvents" in $$props) $$invalidate(5, pointerEvents = $$props.pointerEvents);
    		if ("$$scope" in $$props) $$invalidate(6, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		getContext,
    		zIndex,
    		pointerEvents,
    		zIndexStyle,
    		pointerEventsStyle,
    		padding,
    		$padding
    	});

    	$$self.$inject_state = $$props => {
    		if ("zIndex" in $$props) $$invalidate(4, zIndex = $$props.zIndex);
    		if ("pointerEvents" in $$props) $$invalidate(5, pointerEvents = $$props.pointerEvents);
    		if ("zIndexStyle" in $$props) $$invalidate(0, zIndexStyle = $$props.zIndexStyle);
    		if ("pointerEventsStyle" in $$props) $$invalidate(1, pointerEventsStyle = $$props.pointerEventsStyle);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*zIndex*/ 16) {
    			 $$invalidate(0, zIndexStyle = typeof zIndex !== "undefined"
    			? `z-index:${zIndex};`
    			: "");
    		}

    		if ($$self.$$.dirty & /*pointerEvents*/ 32) {
    			 $$invalidate(1, pointerEventsStyle = pointerEvents === false ? "pointer-events:none;" : "");
    		}
    	};

    	return [
    		zIndexStyle,
    		pointerEventsStyle,
    		$padding,
    		padding,
    		zIndex,
    		pointerEvents,
    		$$scope,
    		$$slots
    	];
    }

    class Html extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$1, create_fragment$1, safe_not_equal, { zIndex: 4, pointerEvents: 5 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Html",
    			options,
    			id: create_fragment$1.name
    		});
    	}

    	get zIndex() {
    		throw new Error("<Html>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set zIndex(value) {
    		throw new Error("<Html>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get pointerEvents() {
    		throw new Error("<Html>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set pointerEvents(value) {
    		throw new Error("<Html>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* node_modules/layercake/src/layouts/Svg.svelte generated by Svelte v3.23.2 */
    const file$2 = "node_modules/layercake/src/layouts/Svg.svelte";
    const get_defs_slot_changes = dirty => ({});
    const get_defs_slot_context = ctx => ({});

    function create_fragment$2(ctx) {
    	let svg;
    	let defs;
    	let g;
    	let g_transform_value;
    	let svg_style_value;
    	let current;
    	const defs_slot_template = /*$$slots*/ ctx[12].defs;
    	const defs_slot = create_slot(defs_slot_template, ctx, /*$$scope*/ ctx[11], get_defs_slot_context);
    	const default_slot_template = /*$$slots*/ ctx[12].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[11], null);

    	const block = {
    		c: function create() {
    			svg = svg_element("svg");
    			defs = svg_element("defs");
    			if (defs_slot) defs_slot.c();
    			g = svg_element("g");
    			if (default_slot) default_slot.c();
    			add_location(defs, file$2, 22, 1, 598);
    			attr_dev(g, "transform", g_transform_value = "translate(" + /*$padding*/ ctx[5].left + ", " + /*$padding*/ ctx[5].top + ")");
    			add_location(g, file$2, 25, 1, 643);
    			attr_dev(svg, "class", "layercake-layout-svg svelte-u84d8d");
    			attr_dev(svg, "viewBox", /*viewBox*/ ctx[0]);
    			attr_dev(svg, "width", /*$containerWidth*/ ctx[3]);
    			attr_dev(svg, "height", /*$containerHeight*/ ctx[4]);
    			attr_dev(svg, "style", svg_style_value = "" + (/*zIndexStyle*/ ctx[1] + /*pointerEventsStyle*/ ctx[2]));
    			add_location(svg, file$2, 15, 0, 454);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, svg, anchor);
    			append_dev(svg, defs);

    			if (defs_slot) {
    				defs_slot.m(defs, null);
    			}

    			append_dev(svg, g);

    			if (default_slot) {
    				default_slot.m(g, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (defs_slot) {
    				if (defs_slot.p && dirty & /*$$scope*/ 2048) {
    					update_slot(defs_slot, defs_slot_template, ctx, /*$$scope*/ ctx[11], dirty, get_defs_slot_changes, get_defs_slot_context);
    				}
    			}

    			if (default_slot) {
    				if (default_slot.p && dirty & /*$$scope*/ 2048) {
    					update_slot(default_slot, default_slot_template, ctx, /*$$scope*/ ctx[11], dirty, null, null);
    				}
    			}

    			if (!current || dirty & /*$padding*/ 32 && g_transform_value !== (g_transform_value = "translate(" + /*$padding*/ ctx[5].left + ", " + /*$padding*/ ctx[5].top + ")")) {
    				attr_dev(g, "transform", g_transform_value);
    			}

    			if (!current || dirty & /*viewBox*/ 1) {
    				attr_dev(svg, "viewBox", /*viewBox*/ ctx[0]);
    			}

    			if (!current || dirty & /*$containerWidth*/ 8) {
    				attr_dev(svg, "width", /*$containerWidth*/ ctx[3]);
    			}

    			if (!current || dirty & /*$containerHeight*/ 16) {
    				attr_dev(svg, "height", /*$containerHeight*/ ctx[4]);
    			}

    			if (!current || dirty & /*zIndexStyle, pointerEventsStyle*/ 6 && svg_style_value !== (svg_style_value = "" + (/*zIndexStyle*/ ctx[1] + /*pointerEventsStyle*/ ctx[2]))) {
    				attr_dev(svg, "style", svg_style_value);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(defs_slot, local);
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(defs_slot, local);
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(svg);
    			if (defs_slot) defs_slot.d(detaching);
    			if (default_slot) default_slot.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$2.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$2($$self, $$props, $$invalidate) {
    	let $containerWidth;
    	let $containerHeight;
    	let $padding;
    	let { viewBox = undefined } = $$props;
    	let { zIndex = undefined } = $$props;
    	let { pointerEvents = undefined } = $$props;
    	let zIndexStyle = "";
    	let pointerEventsStyle = "";
    	const { containerWidth, containerHeight, padding } = getContext("LayerCake");
    	validate_store(containerWidth, "containerWidth");
    	component_subscribe($$self, containerWidth, value => $$invalidate(3, $containerWidth = value));
    	validate_store(containerHeight, "containerHeight");
    	component_subscribe($$self, containerHeight, value => $$invalidate(4, $containerHeight = value));
    	validate_store(padding, "padding");
    	component_subscribe($$self, padding, value => $$invalidate(5, $padding = value));
    	const writable_props = ["viewBox", "zIndex", "pointerEvents"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Svg> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Svg", $$slots, ['defs','default']);

    	$$self.$set = $$props => {
    		if ("viewBox" in $$props) $$invalidate(0, viewBox = $$props.viewBox);
    		if ("zIndex" in $$props) $$invalidate(9, zIndex = $$props.zIndex);
    		if ("pointerEvents" in $$props) $$invalidate(10, pointerEvents = $$props.pointerEvents);
    		if ("$$scope" in $$props) $$invalidate(11, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		getContext,
    		viewBox,
    		zIndex,
    		pointerEvents,
    		zIndexStyle,
    		pointerEventsStyle,
    		containerWidth,
    		containerHeight,
    		padding,
    		$containerWidth,
    		$containerHeight,
    		$padding
    	});

    	$$self.$inject_state = $$props => {
    		if ("viewBox" in $$props) $$invalidate(0, viewBox = $$props.viewBox);
    		if ("zIndex" in $$props) $$invalidate(9, zIndex = $$props.zIndex);
    		if ("pointerEvents" in $$props) $$invalidate(10, pointerEvents = $$props.pointerEvents);
    		if ("zIndexStyle" in $$props) $$invalidate(1, zIndexStyle = $$props.zIndexStyle);
    		if ("pointerEventsStyle" in $$props) $$invalidate(2, pointerEventsStyle = $$props.pointerEventsStyle);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*zIndex*/ 512) {
    			 $$invalidate(1, zIndexStyle = typeof zIndex !== "undefined"
    			? `z-index:${zIndex};`
    			: "");
    		}

    		if ($$self.$$.dirty & /*pointerEvents*/ 1024) {
    			 $$invalidate(2, pointerEventsStyle = pointerEvents === false ? "pointer-events:none;" : "");
    		}
    	};

    	return [
    		viewBox,
    		zIndexStyle,
    		pointerEventsStyle,
    		$containerWidth,
    		$containerHeight,
    		$padding,
    		containerWidth,
    		containerHeight,
    		padding,
    		zIndex,
    		pointerEvents,
    		$$scope,
    		$$slots
    	];
    }

    class Svg extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$2, create_fragment$2, safe_not_equal, { viewBox: 0, zIndex: 9, pointerEvents: 10 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Svg",
    			options,
    			id: create_fragment$2.name
    		});
    	}

    	get viewBox() {
    		throw new Error("<Svg>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set viewBox(value) {
    		throw new Error("<Svg>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get zIndex() {
    		throw new Error("<Svg>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set zIndex(value) {
    		throw new Error("<Svg>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get pointerEvents() {
    		throw new Error("<Svg>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set pointerEvents(value) {
    		throw new Error("<Svg>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/components/Bubble.svg.svelte generated by Svelte v3.23.2 */
    const file$3 = "src/components/Bubble.svg.svelte";

    function get_each_context(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[15] = list[i];
    	return child_ctx;
    }

    // (14:1) {#each $data as d}
    function create_each_block(ctx) {
    	let circle;
    	let circle_cx_value;
    	let circle_cy_value;
    	let circle_r_value;

    	const block = {
    		c: function create() {
    			circle = svg_element("circle");
    			attr_dev(circle, "cx", circle_cx_value = /*$xGet*/ ctx[5](/*d*/ ctx[15]));
    			attr_dev(circle, "cy", circle_cy_value = /*$yGet*/ ctx[6](/*d*/ ctx[15]));
    			attr_dev(circle, "r", circle_r_value = /*$rGet*/ ctx[7](/*d*/ ctx[15]));
    			attr_dev(circle, "fill", /*fill*/ ctx[0]);
    			attr_dev(circle, "stroke", /*stroke*/ ctx[2]);
    			attr_dev(circle, "opacity", /*opacity*/ ctx[1]);
    			attr_dev(circle, "stroke-width", /*strokeWidth*/ ctx[3]);
    			add_location(circle, file$3, 14, 2, 308);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, circle, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*$xGet, $data*/ 48 && circle_cx_value !== (circle_cx_value = /*$xGet*/ ctx[5](/*d*/ ctx[15]))) {
    				attr_dev(circle, "cx", circle_cx_value);
    			}

    			if (dirty & /*$yGet, $data*/ 80 && circle_cy_value !== (circle_cy_value = /*$yGet*/ ctx[6](/*d*/ ctx[15]))) {
    				attr_dev(circle, "cy", circle_cy_value);
    			}

    			if (dirty & /*$rGet, $data*/ 144 && circle_r_value !== (circle_r_value = /*$rGet*/ ctx[7](/*d*/ ctx[15]))) {
    				attr_dev(circle, "r", circle_r_value);
    			}

    			if (dirty & /*fill*/ 1) {
    				attr_dev(circle, "fill", /*fill*/ ctx[0]);
    			}

    			if (dirty & /*stroke*/ 4) {
    				attr_dev(circle, "stroke", /*stroke*/ ctx[2]);
    			}

    			if (dirty & /*opacity*/ 2) {
    				attr_dev(circle, "opacity", /*opacity*/ ctx[1]);
    			}

    			if (dirty & /*strokeWidth*/ 8) {
    				attr_dev(circle, "stroke-width", /*strokeWidth*/ ctx[3]);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(circle);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block.name,
    		type: "each",
    		source: "(14:1) {#each $data as d}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$3(ctx) {
    	let g;
    	let each_value = /*$data*/ ctx[4];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			g = svg_element("g");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(g, "class", "scatter-group");
    			add_location(g, file$3, 12, 0, 260);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, g, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(g, null);
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*$xGet, $data, $yGet, $rGet, fill, stroke, opacity, strokeWidth*/ 255) {
    				each_value = /*$data*/ ctx[4];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(g, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(g);
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$3.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$3($$self, $$props, $$invalidate) {
    	let $data;
    	let $xGet;
    	let $yGet;
    	let $rGet;
    	const { data, xGet, yGet, rGet, xScale, yScale, rScale } = getContext("LayerCake");
    	validate_store(data, "data");
    	component_subscribe($$self, data, value => $$invalidate(4, $data = value));
    	validate_store(xGet, "xGet");
    	component_subscribe($$self, xGet, value => $$invalidate(5, $xGet = value));
    	validate_store(yGet, "yGet");
    	component_subscribe($$self, yGet, value => $$invalidate(6, $yGet = value));
    	validate_store(rGet, "rGet");
    	component_subscribe($$self, rGet, value => $$invalidate(7, $rGet = value));
    	let { fill = "#ccc" } = $$props;
    	let { opacity = 0.6 } = $$props;
    	let { stroke = "#b4b4b4" } = $$props;
    	let { strokeWidth = 1 } = $$props;
    	const writable_props = ["fill", "opacity", "stroke", "strokeWidth"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Bubble_svg> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Bubble_svg", $$slots, []);

    	$$self.$set = $$props => {
    		if ("fill" in $$props) $$invalidate(0, fill = $$props.fill);
    		if ("opacity" in $$props) $$invalidate(1, opacity = $$props.opacity);
    		if ("stroke" in $$props) $$invalidate(2, stroke = $$props.stroke);
    		if ("strokeWidth" in $$props) $$invalidate(3, strokeWidth = $$props.strokeWidth);
    	};

    	$$self.$capture_state = () => ({
    		getContext,
    		data,
    		xGet,
    		yGet,
    		rGet,
    		xScale,
    		yScale,
    		rScale,
    		fill,
    		opacity,
    		stroke,
    		strokeWidth,
    		$data,
    		$xGet,
    		$yGet,
    		$rGet
    	});

    	$$self.$inject_state = $$props => {
    		if ("fill" in $$props) $$invalidate(0, fill = $$props.fill);
    		if ("opacity" in $$props) $$invalidate(1, opacity = $$props.opacity);
    		if ("stroke" in $$props) $$invalidate(2, stroke = $$props.stroke);
    		if ("strokeWidth" in $$props) $$invalidate(3, strokeWidth = $$props.strokeWidth);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		fill,
    		opacity,
    		stroke,
    		strokeWidth,
    		$data,
    		$xGet,
    		$yGet,
    		$rGet,
    		data,
    		xGet,
    		yGet,
    		rGet
    	];
    }

    class Bubble_svg extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$3, create_fragment$3, safe_not_equal, {
    			fill: 0,
    			opacity: 1,
    			stroke: 2,
    			strokeWidth: 3
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Bubble_svg",
    			options,
    			id: create_fragment$3.name
    		});
    	}

    	get fill() {
    		throw new Error("<Bubble_svg>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set fill(value) {
    		throw new Error("<Bubble_svg>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get opacity() {
    		throw new Error("<Bubble_svg>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set opacity(value) {
    		throw new Error("<Bubble_svg>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get stroke() {
    		throw new Error("<Bubble_svg>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set stroke(value) {
    		throw new Error("<Bubble_svg>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get strokeWidth() {
    		throw new Error("<Bubble_svg>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set strokeWidth(value) {
    		throw new Error("<Bubble_svg>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/components/AxisX.svelte generated by Svelte v3.23.2 */
    const file$4 = "src/components/AxisX.svelte";

    function get_each_context$1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[21] = list[i];
    	child_ctx[23] = i;
    	return child_ctx;
    }

    // (39:3) {#if gridlines !== false}
    function create_if_block_1(ctx) {
    	let line;
    	let line_y__value;

    	const block = {
    		c: function create() {
    			line = svg_element("line");
    			attr_dev(line, "y1", line_y__value = /*$height*/ ctx[11] * -1);
    			attr_dev(line, "y2", "0");
    			attr_dev(line, "x1", "0");
    			attr_dev(line, "x2", "0");
    			attr_dev(line, "class", "svelte-js3js8");
    			add_location(line, file$4, 39, 4, 918);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, line, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*$height*/ 2048 && line_y__value !== (line_y__value = /*$height*/ ctx[11] * -1)) {
    				attr_dev(line, "y1", line_y__value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(line);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1.name,
    		type: "if",
    		source: "(39:3) {#if gridlines !== false}",
    		ctx
    	});

    	return block;
    }

    // (37:1) {#each tickVals as tick, i}
    function create_each_block$1(ctx) {
    	let g;
    	let text_1;
    	let t_value = /*formatTick*/ ctx[1](/*tick*/ ctx[21]) + "";
    	let t;
    	let text_1_x_value;
    	let text_1_text_anchor_value;
    	let g_class_value;
    	let g_transform_value;
    	let if_block = /*gridlines*/ ctx[0] !== false && create_if_block_1(ctx);

    	const block = {
    		c: function create() {
    			g = svg_element("g");
    			if (if_block) if_block.c();
    			text_1 = svg_element("text");
    			t = text(t_value);

    			attr_dev(text_1, "x", text_1_x_value = /*xTick*/ ctx[3] || /*isBandwidth*/ ctx[7]
    			? /*$xScale*/ ctx[8].bandwidth() / 2
    			: 0);

    			attr_dev(text_1, "y", /*yTick*/ ctx[4]);
    			attr_dev(text_1, "dx", /*dxTick*/ ctx[5]);
    			attr_dev(text_1, "dy", /*dyTick*/ ctx[6]);
    			attr_dev(text_1, "text-anchor", text_1_text_anchor_value = /*textAnchor*/ ctx[17](/*i*/ ctx[23]));
    			attr_dev(text_1, "class", "svelte-js3js8");
    			add_location(text_1, file$4, 41, 3, 985);
    			attr_dev(g, "class", g_class_value = "tick tick-" + /*tick*/ ctx[21] + " svelte-js3js8");
    			attr_dev(g, "transform", g_transform_value = "translate(" + /*$xScale*/ ctx[8](/*tick*/ ctx[21]) + "," + /*$yRange*/ ctx[10][0] + ")");
    			add_location(g, file$4, 37, 2, 802);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, g, anchor);
    			if (if_block) if_block.m(g, null);
    			append_dev(g, text_1);
    			append_dev(text_1, t);
    		},
    		p: function update(ctx, dirty) {
    			if (/*gridlines*/ ctx[0] !== false) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block_1(ctx);
    					if_block.c();
    					if_block.m(g, text_1);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}

    			if (dirty & /*formatTick, tickVals*/ 514 && t_value !== (t_value = /*formatTick*/ ctx[1](/*tick*/ ctx[21]) + "")) set_data_dev(t, t_value);

    			if (dirty & /*xTick, isBandwidth, $xScale*/ 392 && text_1_x_value !== (text_1_x_value = /*xTick*/ ctx[3] || /*isBandwidth*/ ctx[7]
    			? /*$xScale*/ ctx[8].bandwidth() / 2
    			: 0)) {
    				attr_dev(text_1, "x", text_1_x_value);
    			}

    			if (dirty & /*yTick*/ 16) {
    				attr_dev(text_1, "y", /*yTick*/ ctx[4]);
    			}

    			if (dirty & /*dxTick*/ 32) {
    				attr_dev(text_1, "dx", /*dxTick*/ ctx[5]);
    			}

    			if (dirty & /*dyTick*/ 64) {
    				attr_dev(text_1, "dy", /*dyTick*/ ctx[6]);
    			}

    			if (dirty & /*tickVals*/ 512 && g_class_value !== (g_class_value = "tick tick-" + /*tick*/ ctx[21] + " svelte-js3js8")) {
    				attr_dev(g, "class", g_class_value);
    			}

    			if (dirty & /*$xScale, tickVals, $yRange*/ 1792 && g_transform_value !== (g_transform_value = "translate(" + /*$xScale*/ ctx[8](/*tick*/ ctx[21]) + "," + /*$yRange*/ ctx[10][0] + ")")) {
    				attr_dev(g, "transform", g_transform_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(g);
    			if (if_block) if_block.d();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$1.name,
    		type: "each",
    		source: "(37:1) {#each tickVals as tick, i}",
    		ctx
    	});

    	return block;
    }

    // (50:1) {#if baseline === true}
    function create_if_block$1(ctx) {
    	let line;
    	let line_y__value;
    	let line_y__value_1;

    	const block = {
    		c: function create() {
    			line = svg_element("line");
    			attr_dev(line, "class", "baseline svelte-js3js8");
    			attr_dev(line, "y1", line_y__value = /*$height*/ ctx[11] + 0.5);
    			attr_dev(line, "y2", line_y__value_1 = /*$height*/ ctx[11] + 0.5);
    			attr_dev(line, "x1", "0");
    			attr_dev(line, "x2", /*$width*/ ctx[12]);
    			add_location(line, file$4, 50, 2, 1208);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, line, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*$height*/ 2048 && line_y__value !== (line_y__value = /*$height*/ ctx[11] + 0.5)) {
    				attr_dev(line, "y1", line_y__value);
    			}

    			if (dirty & /*$height*/ 2048 && line_y__value_1 !== (line_y__value_1 = /*$height*/ ctx[11] + 0.5)) {
    				attr_dev(line, "y2", line_y__value_1);
    			}

    			if (dirty & /*$width*/ 4096) {
    				attr_dev(line, "x2", /*$width*/ ctx[12]);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(line);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$1.name,
    		type: "if",
    		source: "(50:1) {#if baseline === true}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$4(ctx) {
    	let g;
    	let each_1_anchor;
    	let each_value = /*tickVals*/ ctx[9];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$1(get_each_context$1(ctx, each_value, i));
    	}

    	let if_block = /*baseline*/ ctx[2] === true && create_if_block$1(ctx);

    	const block = {
    		c: function create() {
    			g = svg_element("g");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			each_1_anchor = empty();
    			if (if_block) if_block.c();
    			attr_dev(g, "class", "axis x-axis");
    			add_location(g, file$4, 35, 0, 747);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, g, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(g, null);
    			}

    			append_dev(g, each_1_anchor);
    			if (if_block) if_block.m(g, null);
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*tickVals, $xScale, $yRange, xTick, isBandwidth, yTick, dxTick, dyTick, textAnchor, formatTick, $height, gridlines*/ 135163) {
    				each_value = /*tickVals*/ ctx[9];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$1(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block$1(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(g, each_1_anchor);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}

    			if (/*baseline*/ ctx[2] === true) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block$1(ctx);
    					if_block.c();
    					if_block.m(g, null);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(g);
    			destroy_each(each_blocks, detaching);
    			if (if_block) if_block.d();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$4.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$4($$self, $$props, $$invalidate) {
    	let $xScale;
    	let $yRange;
    	let $height;
    	let $width;
    	const { width, height, xScale, yScale, yRange } = getContext("LayerCake");
    	validate_store(width, "width");
    	component_subscribe($$self, width, value => $$invalidate(12, $width = value));
    	validate_store(height, "height");
    	component_subscribe($$self, height, value => $$invalidate(11, $height = value));
    	validate_store(xScale, "xScale");
    	component_subscribe($$self, xScale, value => $$invalidate(8, $xScale = value));
    	validate_store(yRange, "yRange");
    	component_subscribe($$self, yRange, value => $$invalidate(10, $yRange = value));
    	let { gridlines = true } = $$props;
    	let { formatTick = d => d } = $$props;
    	let { baseline = false } = $$props;
    	let { snapTicks = false } = $$props;
    	let { ticks = undefined } = $$props;
    	let { xTick = undefined } = $$props;
    	let { yTick = 16 } = $$props;
    	let { dxTick = 0 } = $$props;
    	let { dyTick = 0 } = $$props;

    	function textAnchor(i) {
    		if (snapTicks === true) {
    			if (i === 0) {
    				return "start";
    			}

    			if (i === tickVals.length - 1) {
    				return "end";
    			}
    		}

    		return "middle";
    	}

    	const writable_props = [
    		"gridlines",
    		"formatTick",
    		"baseline",
    		"snapTicks",
    		"ticks",
    		"xTick",
    		"yTick",
    		"dxTick",
    		"dyTick"
    	];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<AxisX> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("AxisX", $$slots, []);

    	$$self.$set = $$props => {
    		if ("gridlines" in $$props) $$invalidate(0, gridlines = $$props.gridlines);
    		if ("formatTick" in $$props) $$invalidate(1, formatTick = $$props.formatTick);
    		if ("baseline" in $$props) $$invalidate(2, baseline = $$props.baseline);
    		if ("snapTicks" in $$props) $$invalidate(18, snapTicks = $$props.snapTicks);
    		if ("ticks" in $$props) $$invalidate(19, ticks = $$props.ticks);
    		if ("xTick" in $$props) $$invalidate(3, xTick = $$props.xTick);
    		if ("yTick" in $$props) $$invalidate(4, yTick = $$props.yTick);
    		if ("dxTick" in $$props) $$invalidate(5, dxTick = $$props.dxTick);
    		if ("dyTick" in $$props) $$invalidate(6, dyTick = $$props.dyTick);
    	};

    	$$self.$capture_state = () => ({
    		getContext,
    		width,
    		height,
    		xScale,
    		yScale,
    		yRange,
    		gridlines,
    		formatTick,
    		baseline,
    		snapTicks,
    		ticks,
    		xTick,
    		yTick,
    		dxTick,
    		dyTick,
    		textAnchor,
    		isBandwidth,
    		$xScale,
    		tickVals,
    		$yRange,
    		$height,
    		$width
    	});

    	$$self.$inject_state = $$props => {
    		if ("gridlines" in $$props) $$invalidate(0, gridlines = $$props.gridlines);
    		if ("formatTick" in $$props) $$invalidate(1, formatTick = $$props.formatTick);
    		if ("baseline" in $$props) $$invalidate(2, baseline = $$props.baseline);
    		if ("snapTicks" in $$props) $$invalidate(18, snapTicks = $$props.snapTicks);
    		if ("ticks" in $$props) $$invalidate(19, ticks = $$props.ticks);
    		if ("xTick" in $$props) $$invalidate(3, xTick = $$props.xTick);
    		if ("yTick" in $$props) $$invalidate(4, yTick = $$props.yTick);
    		if ("dxTick" in $$props) $$invalidate(5, dxTick = $$props.dxTick);
    		if ("dyTick" in $$props) $$invalidate(6, dyTick = $$props.dyTick);
    		if ("isBandwidth" in $$props) $$invalidate(7, isBandwidth = $$props.isBandwidth);
    		if ("tickVals" in $$props) $$invalidate(9, tickVals = $$props.tickVals);
    	};

    	let isBandwidth;
    	let tickVals;

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*$xScale*/ 256) {
    			 $$invalidate(7, isBandwidth = typeof $xScale.bandwidth === "function");
    		}

    		if ($$self.$$.dirty & /*ticks, isBandwidth, $xScale*/ 524672) {
    			 $$invalidate(9, tickVals = Array.isArray(ticks)
    			? ticks
    			: isBandwidth ? $xScale.domain() : $xScale.ticks(ticks));
    		}
    	};

    	return [
    		gridlines,
    		formatTick,
    		baseline,
    		xTick,
    		yTick,
    		dxTick,
    		dyTick,
    		isBandwidth,
    		$xScale,
    		tickVals,
    		$yRange,
    		$height,
    		$width,
    		width,
    		height,
    		xScale,
    		yRange,
    		textAnchor,
    		snapTicks,
    		ticks
    	];
    }

    class AxisX extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$4, create_fragment$4, safe_not_equal, {
    			gridlines: 0,
    			formatTick: 1,
    			baseline: 2,
    			snapTicks: 18,
    			ticks: 19,
    			xTick: 3,
    			yTick: 4,
    			dxTick: 5,
    			dyTick: 6
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "AxisX",
    			options,
    			id: create_fragment$4.name
    		});
    	}

    	get gridlines() {
    		throw new Error("<AxisX>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set gridlines(value) {
    		throw new Error("<AxisX>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get formatTick() {
    		throw new Error("<AxisX>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set formatTick(value) {
    		throw new Error("<AxisX>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get baseline() {
    		throw new Error("<AxisX>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set baseline(value) {
    		throw new Error("<AxisX>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get snapTicks() {
    		throw new Error("<AxisX>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set snapTicks(value) {
    		throw new Error("<AxisX>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get ticks() {
    		throw new Error("<AxisX>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set ticks(value) {
    		throw new Error("<AxisX>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get xTick() {
    		throw new Error("<AxisX>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set xTick(value) {
    		throw new Error("<AxisX>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get yTick() {
    		throw new Error("<AxisX>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set yTick(value) {
    		throw new Error("<AxisX>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get dxTick() {
    		throw new Error("<AxisX>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set dxTick(value) {
    		throw new Error("<AxisX>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get dyTick() {
    		throw new Error("<AxisX>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set dyTick(value) {
    		throw new Error("<AxisX>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/components/AxisY.svelte generated by Svelte v3.23.2 */
    const file$5 = "src/components/AxisY.svelte";

    function get_each_context$2(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[17] = list[i];
    	child_ctx[19] = i;
    	return child_ctx;
    }

    // (26:3) {#if gridlines !== false}
    function create_if_block$2(ctx) {
    	let line;
    	let line_y__value;
    	let line_y__value_1;

    	const block = {
    		c: function create() {
    			line = svg_element("line");
    			attr_dev(line, "x2", "100%");

    			attr_dev(line, "y1", line_y__value = /*yTick*/ ctx[3] + (/*isBandwidth*/ ctx[7]
    			? /*$yScale*/ ctx[8].bandwidth() / 2
    			: 0));

    			attr_dev(line, "y2", line_y__value_1 = /*yTick*/ ctx[3] + (/*isBandwidth*/ ctx[7]
    			? /*$yScale*/ ctx[8].bandwidth() / 2
    			: 0));

    			attr_dev(line, "class", "svelte-12j1f07");
    			add_location(line, file$5, 26, 4, 764);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, line, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*yTick, isBandwidth, $yScale*/ 392 && line_y__value !== (line_y__value = /*yTick*/ ctx[3] + (/*isBandwidth*/ ctx[7]
    			? /*$yScale*/ ctx[8].bandwidth() / 2
    			: 0))) {
    				attr_dev(line, "y1", line_y__value);
    			}

    			if (dirty & /*yTick, isBandwidth, $yScale*/ 392 && line_y__value_1 !== (line_y__value_1 = /*yTick*/ ctx[3] + (/*isBandwidth*/ ctx[7]
    			? /*$yScale*/ ctx[8].bandwidth() / 2
    			: 0))) {
    				attr_dev(line, "y2", line_y__value_1);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(line);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$2.name,
    		type: "if",
    		source: "(26:3) {#if gridlines !== false}",
    		ctx
    	});

    	return block;
    }

    // (24:1) {#each tickVals as tick, i}
    function create_each_block$2(ctx) {
    	let g;
    	let text_1;
    	let t_value = /*formatTick*/ ctx[1](/*tick*/ ctx[17]) + "";
    	let t;
    	let text_1_y_value;
    	let text_1_dx_value;
    	let text_1_dy_value;
    	let g_class_value;
    	let g_transform_value;
    	let if_block = /*gridlines*/ ctx[0] !== false && create_if_block$2(ctx);

    	const block = {
    		c: function create() {
    			g = svg_element("g");
    			if (if_block) if_block.c();
    			text_1 = svg_element("text");
    			t = text(t_value);
    			attr_dev(text_1, "x", /*xTick*/ ctx[2]);

    			attr_dev(text_1, "y", text_1_y_value = /*yTick*/ ctx[3] + (/*isBandwidth*/ ctx[7]
    			? /*$yScale*/ ctx[8].bandwidth() / 2
    			: 0));

    			attr_dev(text_1, "dx", text_1_dx_value = /*isBandwidth*/ ctx[7] ? -5 : /*dxTick*/ ctx[4]);
    			attr_dev(text_1, "dy", text_1_dy_value = /*isBandwidth*/ ctx[7] ? 4 : /*dyTick*/ ctx[5]);
    			set_style(text_1, "text-anchor", /*isBandwidth*/ ctx[7] ? "end" : /*textAnchor*/ ctx[6]);
    			attr_dev(text_1, "class", "svelte-12j1f07");
    			add_location(text_1, file$5, 32, 3, 938);
    			attr_dev(g, "class", g_class_value = "tick tick-" + /*tick*/ ctx[17] + " svelte-12j1f07");
    			attr_dev(g, "transform", g_transform_value = "translate(" + (/*$xRange*/ ctx[11][0] + (/*isBandwidth*/ ctx[7] ? /*$padding*/ ctx[10].left : 0)) + ", " + /*$yScale*/ ctx[8](/*tick*/ ctx[17]) + ")");
    			add_location(g, file$5, 24, 2, 613);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, g, anchor);
    			if (if_block) if_block.m(g, null);
    			append_dev(g, text_1);
    			append_dev(text_1, t);
    		},
    		p: function update(ctx, dirty) {
    			if (/*gridlines*/ ctx[0] !== false) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block$2(ctx);
    					if_block.c();
    					if_block.m(g, text_1);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}

    			if (dirty & /*formatTick, tickVals*/ 514 && t_value !== (t_value = /*formatTick*/ ctx[1](/*tick*/ ctx[17]) + "")) set_data_dev(t, t_value);

    			if (dirty & /*xTick*/ 4) {
    				attr_dev(text_1, "x", /*xTick*/ ctx[2]);
    			}

    			if (dirty & /*yTick, isBandwidth, $yScale*/ 392 && text_1_y_value !== (text_1_y_value = /*yTick*/ ctx[3] + (/*isBandwidth*/ ctx[7]
    			? /*$yScale*/ ctx[8].bandwidth() / 2
    			: 0))) {
    				attr_dev(text_1, "y", text_1_y_value);
    			}

    			if (dirty & /*isBandwidth, dxTick*/ 144 && text_1_dx_value !== (text_1_dx_value = /*isBandwidth*/ ctx[7] ? -5 : /*dxTick*/ ctx[4])) {
    				attr_dev(text_1, "dx", text_1_dx_value);
    			}

    			if (dirty & /*isBandwidth, dyTick*/ 160 && text_1_dy_value !== (text_1_dy_value = /*isBandwidth*/ ctx[7] ? 4 : /*dyTick*/ ctx[5])) {
    				attr_dev(text_1, "dy", text_1_dy_value);
    			}

    			if (dirty & /*isBandwidth, textAnchor*/ 192) {
    				set_style(text_1, "text-anchor", /*isBandwidth*/ ctx[7] ? "end" : /*textAnchor*/ ctx[6]);
    			}

    			if (dirty & /*tickVals*/ 512 && g_class_value !== (g_class_value = "tick tick-" + /*tick*/ ctx[17] + " svelte-12j1f07")) {
    				attr_dev(g, "class", g_class_value);
    			}

    			if (dirty & /*$xRange, isBandwidth, $padding, $yScale, tickVals*/ 3968 && g_transform_value !== (g_transform_value = "translate(" + (/*$xRange*/ ctx[11][0] + (/*isBandwidth*/ ctx[7] ? /*$padding*/ ctx[10].left : 0)) + ", " + /*$yScale*/ ctx[8](/*tick*/ ctx[17]) + ")")) {
    				attr_dev(g, "transform", g_transform_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(g);
    			if (if_block) if_block.d();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$2.name,
    		type: "each",
    		source: "(24:1) {#each tickVals as tick, i}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$5(ctx) {
    	let g;
    	let g_transform_value;
    	let each_value = /*tickVals*/ ctx[9];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$2(get_each_context$2(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			g = svg_element("g");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(g, "class", "axis y-axis");
    			attr_dev(g, "transform", g_transform_value = "translate(" + -/*$padding*/ ctx[10].left + ", 0)");
    			add_location(g, file$5, 22, 0, 515);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, g, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(g, null);
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*tickVals, $xRange, isBandwidth, $padding, $yScale, xTick, yTick, dxTick, dyTick, textAnchor, formatTick, gridlines*/ 4095) {
    				each_value = /*tickVals*/ ctx[9];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$2(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block$2(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(g, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}

    			if (dirty & /*$padding*/ 1024 && g_transform_value !== (g_transform_value = "translate(" + -/*$padding*/ ctx[10].left + ", 0)")) {
    				attr_dev(g, "transform", g_transform_value);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(g);
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$5.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$5($$self, $$props, $$invalidate) {
    	let $yScale;
    	let $padding;
    	let $xRange;
    	const { padding, xRange, xScale, yScale } = getContext("LayerCake");
    	validate_store(padding, "padding");
    	component_subscribe($$self, padding, value => $$invalidate(10, $padding = value));
    	validate_store(xRange, "xRange");
    	component_subscribe($$self, xRange, value => $$invalidate(11, $xRange = value));
    	validate_store(yScale, "yScale");
    	component_subscribe($$self, yScale, value => $$invalidate(8, $yScale = value));
    	let { ticks = 4 } = $$props;
    	let { gridlines = true } = $$props;
    	let { formatTick = d => d } = $$props;
    	let { xTick = 0 } = $$props;
    	let { yTick = 0 } = $$props;
    	let { dxTick = 0 } = $$props;
    	let { dyTick = -4 } = $$props;
    	let { textAnchor = "start" } = $$props;

    	const writable_props = [
    		"ticks",
    		"gridlines",
    		"formatTick",
    		"xTick",
    		"yTick",
    		"dxTick",
    		"dyTick",
    		"textAnchor"
    	];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<AxisY> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("AxisY", $$slots, []);

    	$$self.$set = $$props => {
    		if ("ticks" in $$props) $$invalidate(15, ticks = $$props.ticks);
    		if ("gridlines" in $$props) $$invalidate(0, gridlines = $$props.gridlines);
    		if ("formatTick" in $$props) $$invalidate(1, formatTick = $$props.formatTick);
    		if ("xTick" in $$props) $$invalidate(2, xTick = $$props.xTick);
    		if ("yTick" in $$props) $$invalidate(3, yTick = $$props.yTick);
    		if ("dxTick" in $$props) $$invalidate(4, dxTick = $$props.dxTick);
    		if ("dyTick" in $$props) $$invalidate(5, dyTick = $$props.dyTick);
    		if ("textAnchor" in $$props) $$invalidate(6, textAnchor = $$props.textAnchor);
    	};

    	$$self.$capture_state = () => ({
    		getContext,
    		padding,
    		xRange,
    		xScale,
    		yScale,
    		ticks,
    		gridlines,
    		formatTick,
    		xTick,
    		yTick,
    		dxTick,
    		dyTick,
    		textAnchor,
    		isBandwidth,
    		$yScale,
    		tickVals,
    		$padding,
    		$xRange
    	});

    	$$self.$inject_state = $$props => {
    		if ("ticks" in $$props) $$invalidate(15, ticks = $$props.ticks);
    		if ("gridlines" in $$props) $$invalidate(0, gridlines = $$props.gridlines);
    		if ("formatTick" in $$props) $$invalidate(1, formatTick = $$props.formatTick);
    		if ("xTick" in $$props) $$invalidate(2, xTick = $$props.xTick);
    		if ("yTick" in $$props) $$invalidate(3, yTick = $$props.yTick);
    		if ("dxTick" in $$props) $$invalidate(4, dxTick = $$props.dxTick);
    		if ("dyTick" in $$props) $$invalidate(5, dyTick = $$props.dyTick);
    		if ("textAnchor" in $$props) $$invalidate(6, textAnchor = $$props.textAnchor);
    		if ("isBandwidth" in $$props) $$invalidate(7, isBandwidth = $$props.isBandwidth);
    		if ("tickVals" in $$props) $$invalidate(9, tickVals = $$props.tickVals);
    	};

    	let isBandwidth;
    	let tickVals;

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*$yScale*/ 256) {
    			 $$invalidate(7, isBandwidth = typeof $yScale.bandwidth === "function");
    		}

    		if ($$self.$$.dirty & /*ticks, isBandwidth, $yScale*/ 33152) {
    			 $$invalidate(9, tickVals = Array.isArray(ticks)
    			? ticks
    			: isBandwidth ? $yScale.domain() : $yScale.ticks(ticks));
    		}
    	};

    	return [
    		gridlines,
    		formatTick,
    		xTick,
    		yTick,
    		dxTick,
    		dyTick,
    		textAnchor,
    		isBandwidth,
    		$yScale,
    		tickVals,
    		$padding,
    		$xRange,
    		padding,
    		xRange,
    		yScale,
    		ticks
    	];
    }

    class AxisY extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$5, create_fragment$5, safe_not_equal, {
    			ticks: 15,
    			gridlines: 0,
    			formatTick: 1,
    			xTick: 2,
    			yTick: 3,
    			dxTick: 4,
    			dyTick: 5,
    			textAnchor: 6
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "AxisY",
    			options,
    			id: create_fragment$5.name
    		});
    	}

    	get ticks() {
    		throw new Error("<AxisY>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set ticks(value) {
    		throw new Error("<AxisY>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get gridlines() {
    		throw new Error("<AxisY>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set gridlines(value) {
    		throw new Error("<AxisY>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get formatTick() {
    		throw new Error("<AxisY>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set formatTick(value) {
    		throw new Error("<AxisY>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get xTick() {
    		throw new Error("<AxisY>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set xTick(value) {
    		throw new Error("<AxisY>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get yTick() {
    		throw new Error("<AxisY>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set yTick(value) {
    		throw new Error("<AxisY>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get dxTick() {
    		throw new Error("<AxisY>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set dxTick(value) {
    		throw new Error("<AxisY>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get dyTick() {
    		throw new Error("<AxisY>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set dyTick(value) {
    		throw new Error("<AxisY>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get textAnchor() {
    		throw new Error("<AxisY>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set textAnchor(value) {
    		throw new Error("<AxisY>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    function tree_add(d) {
      const x = +this._x.call(null, d),
          y = +this._y.call(null, d);
      return add(this.cover(x, y), x, y, d);
    }

    function add(tree, x, y, d) {
      if (isNaN(x) || isNaN(y)) return tree; // ignore invalid points

      var parent,
          node = tree._root,
          leaf = {data: d},
          x0 = tree._x0,
          y0 = tree._y0,
          x1 = tree._x1,
          y1 = tree._y1,
          xm,
          ym,
          xp,
          yp,
          right,
          bottom,
          i,
          j;

      // If the tree is empty, initialize the root as a leaf.
      if (!node) return tree._root = leaf, tree;

      // Find the existing leaf for the new point, or add it.
      while (node.length) {
        if (right = x >= (xm = (x0 + x1) / 2)) x0 = xm; else x1 = xm;
        if (bottom = y >= (ym = (y0 + y1) / 2)) y0 = ym; else y1 = ym;
        if (parent = node, !(node = node[i = bottom << 1 | right])) return parent[i] = leaf, tree;
      }

      // Is the new point is exactly coincident with the existing point?
      xp = +tree._x.call(null, node.data);
      yp = +tree._y.call(null, node.data);
      if (x === xp && y === yp) return leaf.next = node, parent ? parent[i] = leaf : tree._root = leaf, tree;

      // Otherwise, split the leaf node until the old and new point are separated.
      do {
        parent = parent ? parent[i] = new Array(4) : tree._root = new Array(4);
        if (right = x >= (xm = (x0 + x1) / 2)) x0 = xm; else x1 = xm;
        if (bottom = y >= (ym = (y0 + y1) / 2)) y0 = ym; else y1 = ym;
      } while ((i = bottom << 1 | right) === (j = (yp >= ym) << 1 | (xp >= xm)));
      return parent[j] = node, parent[i] = leaf, tree;
    }

    function addAll(data) {
      var d, i, n = data.length,
          x,
          y,
          xz = new Array(n),
          yz = new Array(n),
          x0 = Infinity,
          y0 = Infinity,
          x1 = -Infinity,
          y1 = -Infinity;

      // Compute the points and their extent.
      for (i = 0; i < n; ++i) {
        if (isNaN(x = +this._x.call(null, d = data[i])) || isNaN(y = +this._y.call(null, d))) continue;
        xz[i] = x;
        yz[i] = y;
        if (x < x0) x0 = x;
        if (x > x1) x1 = x;
        if (y < y0) y0 = y;
        if (y > y1) y1 = y;
      }

      // If there were no (valid) points, abort.
      if (x0 > x1 || y0 > y1) return this;

      // Expand the tree to cover the new points.
      this.cover(x0, y0).cover(x1, y1);

      // Add the new points.
      for (i = 0; i < n; ++i) {
        add(this, xz[i], yz[i], data[i]);
      }

      return this;
    }

    function tree_cover(x, y) {
      if (isNaN(x = +x) || isNaN(y = +y)) return this; // ignore invalid points

      var x0 = this._x0,
          y0 = this._y0,
          x1 = this._x1,
          y1 = this._y1;

      // If the quadtree has no extent, initialize them.
      // Integer extent are necessary so that if we later double the extent,
      // the existing quadrant boundaries don’t change due to floating point error!
      if (isNaN(x0)) {
        x1 = (x0 = Math.floor(x)) + 1;
        y1 = (y0 = Math.floor(y)) + 1;
      }

      // Otherwise, double repeatedly to cover.
      else {
        var z = x1 - x0 || 1,
            node = this._root,
            parent,
            i;

        while (x0 > x || x >= x1 || y0 > y || y >= y1) {
          i = (y < y0) << 1 | (x < x0);
          parent = new Array(4), parent[i] = node, node = parent, z *= 2;
          switch (i) {
            case 0: x1 = x0 + z, y1 = y0 + z; break;
            case 1: x0 = x1 - z, y1 = y0 + z; break;
            case 2: x1 = x0 + z, y0 = y1 - z; break;
            case 3: x0 = x1 - z, y0 = y1 - z; break;
          }
        }

        if (this._root && this._root.length) this._root = node;
      }

      this._x0 = x0;
      this._y0 = y0;
      this._x1 = x1;
      this._y1 = y1;
      return this;
    }

    function tree_data() {
      var data = [];
      this.visit(function(node) {
        if (!node.length) do data.push(node.data); while (node = node.next)
      });
      return data;
    }

    function tree_extent(_) {
      return arguments.length
          ? this.cover(+_[0][0], +_[0][1]).cover(+_[1][0], +_[1][1])
          : isNaN(this._x0) ? undefined : [[this._x0, this._y0], [this._x1, this._y1]];
    }

    function Quad(node, x0, y0, x1, y1) {
      this.node = node;
      this.x0 = x0;
      this.y0 = y0;
      this.x1 = x1;
      this.y1 = y1;
    }

    function tree_find(x, y, radius) {
      var data,
          x0 = this._x0,
          y0 = this._y0,
          x1,
          y1,
          x2,
          y2,
          x3 = this._x1,
          y3 = this._y1,
          quads = [],
          node = this._root,
          q,
          i;

      if (node) quads.push(new Quad(node, x0, y0, x3, y3));
      if (radius == null) radius = Infinity;
      else {
        x0 = x - radius, y0 = y - radius;
        x3 = x + radius, y3 = y + radius;
        radius *= radius;
      }

      while (q = quads.pop()) {

        // Stop searching if this quadrant can’t contain a closer node.
        if (!(node = q.node)
            || (x1 = q.x0) > x3
            || (y1 = q.y0) > y3
            || (x2 = q.x1) < x0
            || (y2 = q.y1) < y0) continue;

        // Bisect the current quadrant.
        if (node.length) {
          var xm = (x1 + x2) / 2,
              ym = (y1 + y2) / 2;

          quads.push(
            new Quad(node[3], xm, ym, x2, y2),
            new Quad(node[2], x1, ym, xm, y2),
            new Quad(node[1], xm, y1, x2, ym),
            new Quad(node[0], x1, y1, xm, ym)
          );

          // Visit the closest quadrant first.
          if (i = (y >= ym) << 1 | (x >= xm)) {
            q = quads[quads.length - 1];
            quads[quads.length - 1] = quads[quads.length - 1 - i];
            quads[quads.length - 1 - i] = q;
          }
        }

        // Visit this point. (Visiting coincident points isn’t necessary!)
        else {
          var dx = x - +this._x.call(null, node.data),
              dy = y - +this._y.call(null, node.data),
              d2 = dx * dx + dy * dy;
          if (d2 < radius) {
            var d = Math.sqrt(radius = d2);
            x0 = x - d, y0 = y - d;
            x3 = x + d, y3 = y + d;
            data = node.data;
          }
        }
      }

      return data;
    }

    function tree_remove(d) {
      if (isNaN(x = +this._x.call(null, d)) || isNaN(y = +this._y.call(null, d))) return this; // ignore invalid points

      var parent,
          node = this._root,
          retainer,
          previous,
          next,
          x0 = this._x0,
          y0 = this._y0,
          x1 = this._x1,
          y1 = this._y1,
          x,
          y,
          xm,
          ym,
          right,
          bottom,
          i,
          j;

      // If the tree is empty, initialize the root as a leaf.
      if (!node) return this;

      // Find the leaf node for the point.
      // While descending, also retain the deepest parent with a non-removed sibling.
      if (node.length) while (true) {
        if (right = x >= (xm = (x0 + x1) / 2)) x0 = xm; else x1 = xm;
        if (bottom = y >= (ym = (y0 + y1) / 2)) y0 = ym; else y1 = ym;
        if (!(parent = node, node = node[i = bottom << 1 | right])) return this;
        if (!node.length) break;
        if (parent[(i + 1) & 3] || parent[(i + 2) & 3] || parent[(i + 3) & 3]) retainer = parent, j = i;
      }

      // Find the point to remove.
      while (node.data !== d) if (!(previous = node, node = node.next)) return this;
      if (next = node.next) delete node.next;

      // If there are multiple coincident points, remove just the point.
      if (previous) return (next ? previous.next = next : delete previous.next), this;

      // If this is the root point, remove it.
      if (!parent) return this._root = next, this;

      // Remove this leaf.
      next ? parent[i] = next : delete parent[i];

      // If the parent now contains exactly one leaf, collapse superfluous parents.
      if ((node = parent[0] || parent[1] || parent[2] || parent[3])
          && node === (parent[3] || parent[2] || parent[1] || parent[0])
          && !node.length) {
        if (retainer) retainer[j] = node;
        else this._root = node;
      }

      return this;
    }

    function removeAll(data) {
      for (var i = 0, n = data.length; i < n; ++i) this.remove(data[i]);
      return this;
    }

    function tree_root() {
      return this._root;
    }

    function tree_size() {
      var size = 0;
      this.visit(function(node) {
        if (!node.length) do ++size; while (node = node.next)
      });
      return size;
    }

    function tree_visit(callback) {
      var quads = [], q, node = this._root, child, x0, y0, x1, y1;
      if (node) quads.push(new Quad(node, this._x0, this._y0, this._x1, this._y1));
      while (q = quads.pop()) {
        if (!callback(node = q.node, x0 = q.x0, y0 = q.y0, x1 = q.x1, y1 = q.y1) && node.length) {
          var xm = (x0 + x1) / 2, ym = (y0 + y1) / 2;
          if (child = node[3]) quads.push(new Quad(child, xm, ym, x1, y1));
          if (child = node[2]) quads.push(new Quad(child, x0, ym, xm, y1));
          if (child = node[1]) quads.push(new Quad(child, xm, y0, x1, ym));
          if (child = node[0]) quads.push(new Quad(child, x0, y0, xm, ym));
        }
      }
      return this;
    }

    function tree_visitAfter(callback) {
      var quads = [], next = [], q;
      if (this._root) quads.push(new Quad(this._root, this._x0, this._y0, this._x1, this._y1));
      while (q = quads.pop()) {
        var node = q.node;
        if (node.length) {
          var child, x0 = q.x0, y0 = q.y0, x1 = q.x1, y1 = q.y1, xm = (x0 + x1) / 2, ym = (y0 + y1) / 2;
          if (child = node[0]) quads.push(new Quad(child, x0, y0, xm, ym));
          if (child = node[1]) quads.push(new Quad(child, xm, y0, x1, ym));
          if (child = node[2]) quads.push(new Quad(child, x0, ym, xm, y1));
          if (child = node[3]) quads.push(new Quad(child, xm, ym, x1, y1));
        }
        next.push(q);
      }
      while (q = next.pop()) {
        callback(q.node, q.x0, q.y0, q.x1, q.y1);
      }
      return this;
    }

    function defaultX(d) {
      return d[0];
    }

    function tree_x(_) {
      return arguments.length ? (this._x = _, this) : this._x;
    }

    function defaultY(d) {
      return d[1];
    }

    function tree_y(_) {
      return arguments.length ? (this._y = _, this) : this._y;
    }

    function quadtree(nodes, x, y) {
      var tree = new Quadtree(x == null ? defaultX : x, y == null ? defaultY : y, NaN, NaN, NaN, NaN);
      return nodes == null ? tree : tree.addAll(nodes);
    }

    function Quadtree(x, y, x0, y0, x1, y1) {
      this._x = x;
      this._y = y;
      this._x0 = x0;
      this._y0 = y0;
      this._x1 = x1;
      this._y1 = y1;
      this._root = undefined;
    }

    function leaf_copy(leaf) {
      var copy = {data: leaf.data}, next = copy;
      while (leaf = leaf.next) next = next.next = {data: leaf.data};
      return copy;
    }

    var treeProto = quadtree.prototype = Quadtree.prototype;

    treeProto.copy = function() {
      var copy = new Quadtree(this._x, this._y, this._x0, this._y0, this._x1, this._y1),
          node = this._root,
          nodes,
          child;

      if (!node) return copy;

      if (!node.length) return copy._root = leaf_copy(node), copy;

      nodes = [{source: node, target: copy._root = new Array(4)}];
      while (node = nodes.pop()) {
        for (var i = 0; i < 4; ++i) {
          if (child = node.source[i]) {
            if (child.length) nodes.push({source: child, target: node.target[i] = new Array(4)});
            else node.target[i] = leaf_copy(child);
          }
        }
      }

      return copy;
    };

    treeProto.add = tree_add;
    treeProto.addAll = addAll;
    treeProto.cover = tree_cover;
    treeProto.data = tree_data;
    treeProto.extent = tree_extent;
    treeProto.find = tree_find;
    treeProto.remove = tree_remove;
    treeProto.removeAll = removeAll;
    treeProto.root = tree_root;
    treeProto.size = tree_size;
    treeProto.visit = tree_visit;
    treeProto.visitAfter = tree_visitAfter;
    treeProto.x = tree_x;
    treeProto.y = tree_y;

    /* src/components/QuadTree.svelte generated by Svelte v3.23.2 */

    const { Object: Object_1$1 } = globals;
    const file$6 = "src/components/QuadTree.svelte";

    const get_default_slot_changes$1 = dirty => ({
    	x: dirty & /*xGetter, found*/ 10,
    	y: dirty & /*yGetter, found*/ 18,
    	r: dirty & /*rGetter, found*/ 34,
    	found: dirty & /*found*/ 2,
    	visible: dirty & /*visible*/ 1,
    	e: dirty & /*e*/ 4
    });

    const get_default_slot_context$1 = ctx => ({
    	x: /*xGetter*/ ctx[3](/*found*/ ctx[1]) || 0,
    	y: /*yGetter*/ ctx[4](/*found*/ ctx[1]) || 0,
    	r: /*rGetter*/ ctx[5](/*found*/ ctx[1]) || 0,
    	found: /*found*/ ctx[1],
    	visible: /*visible*/ ctx[0],
    	e: /*e*/ ctx[2]
    });

    function create_fragment$6(ctx) {
    	let div;
    	let t;
    	let current;
    	let mounted;
    	let dispose;
    	const default_slot_template = /*$$slots*/ ctx[19].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[18], get_default_slot_context$1);

    	const block = {
    		c: function create() {
    			div = element("div");
    			t = space();
    			if (default_slot) default_slot.c();
    			attr_dev(div, "class", "bg svelte-19xh5jy");
    			add_location(div, file$6, 48, 0, 972);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			insert_dev(target, t, anchor);

    			if (default_slot) {
    				default_slot.m(target, anchor);
    			}

    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(div, "mousemove", /*findItem*/ ctx[12], false, false, false),
    					listen_dev(div, "mouseout", /*mouseout_handler*/ ctx[20], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (default_slot) {
    				if (default_slot.p && dirty & /*$$scope, xGetter, found, yGetter, rGetter, visible, e*/ 262207) {
    					update_slot(default_slot, default_slot_template, ctx, /*$$scope*/ ctx[18], dirty, get_default_slot_changes$1, get_default_slot_context$1);
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (detaching) detach_dev(t);
    			if (default_slot) default_slot.d(detaching);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$6.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$6($$self, $$props, $$invalidate) {
    	let $xGet;
    	let $yGet;
    	let $rGet;
    	let $width;
    	let $height;
    	let $data;
    	const { data, xGet, yGet, rGet, width, height } = getContext("LayerCake");
    	validate_store(data, "data");
    	component_subscribe($$self, data, value => $$invalidate(27, $data = value));
    	validate_store(xGet, "xGet");
    	component_subscribe($$self, xGet, value => $$invalidate(21, $xGet = value));
    	validate_store(yGet, "yGet");
    	component_subscribe($$self, yGet, value => $$invalidate(22, $yGet = value));
    	validate_store(rGet, "rGet");
    	component_subscribe($$self, rGet, value => $$invalidate(23, $rGet = value));
    	validate_store(width, "width");
    	component_subscribe($$self, width, value => $$invalidate(25, $width = value));
    	validate_store(height, "height");
    	component_subscribe($$self, height, value => $$invalidate(26, $height = value));
    	let visible = false;
    	let found = {};
    	let e = {};
    	let { dataset = undefined } = $$props;
    	let { x = "x" } = $$props;
    	let { y = "y" } = $$props;
    	let { r = "r" } = $$props;
    	let { searchRadius = undefined } = $$props;

    	function findItem(evt) {
    		$$invalidate(2, e = evt);
    		const xLayerKey = `layer${x.toUpperCase()}`;
    		const yLayerKey = `layer${y.toUpperCase()}`;
    		$$invalidate(1, found = finder.find(evt[xLayerKey], evt[yLayerKey], searchRadius) || {});
    		$$invalidate(0, visible = Object.keys(found).length > 0);
    	}

    	const writable_props = ["dataset", "x", "y", "r", "searchRadius"];

    	Object_1$1.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<QuadTree> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("QuadTree", $$slots, ['default']);
    	const mouseout_handler = () => $$invalidate(0, visible = false);

    	$$self.$set = $$props => {
    		if ("dataset" in $$props) $$invalidate(13, dataset = $$props.dataset);
    		if ("x" in $$props) $$invalidate(14, x = $$props.x);
    		if ("y" in $$props) $$invalidate(15, y = $$props.y);
    		if ("r" in $$props) $$invalidate(16, r = $$props.r);
    		if ("searchRadius" in $$props) $$invalidate(17, searchRadius = $$props.searchRadius);
    		if ("$$scope" in $$props) $$invalidate(18, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		getContext,
    		quadtree,
    		data,
    		xGet,
    		yGet,
    		rGet,
    		width,
    		height,
    		visible,
    		found,
    		e,
    		dataset,
    		x,
    		y,
    		r,
    		searchRadius,
    		findItem,
    		xGetter,
    		$xGet,
    		$yGet,
    		yGetter,
    		rGetter,
    		$rGet,
    		finder,
    		$width,
    		$height,
    		$data
    	});

    	$$self.$inject_state = $$props => {
    		if ("visible" in $$props) $$invalidate(0, visible = $$props.visible);
    		if ("found" in $$props) $$invalidate(1, found = $$props.found);
    		if ("e" in $$props) $$invalidate(2, e = $$props.e);
    		if ("dataset" in $$props) $$invalidate(13, dataset = $$props.dataset);
    		if ("x" in $$props) $$invalidate(14, x = $$props.x);
    		if ("y" in $$props) $$invalidate(15, y = $$props.y);
    		if ("r" in $$props) $$invalidate(16, r = $$props.r);
    		if ("searchRadius" in $$props) $$invalidate(17, searchRadius = $$props.searchRadius);
    		if ("xGetter" in $$props) $$invalidate(3, xGetter = $$props.xGetter);
    		if ("yGetter" in $$props) $$invalidate(4, yGetter = $$props.yGetter);
    		if ("rGetter" in $$props) $$invalidate(5, rGetter = $$props.rGetter);
    		if ("finder" in $$props) finder = $$props.finder;
    	};

    	let xGetter;
    	let yGetter;
    	let rGetter;
    	let finder;

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*x, $xGet, $yGet*/ 6307840) {
    			 $$invalidate(3, xGetter = x === "x" ? $xGet : $yGet);
    		}

    		if ($$self.$$.dirty & /*y, $yGet, $xGet*/ 6324224) {
    			 $$invalidate(4, yGetter = y === "y" ? $yGet : $xGet);
    		}

    		if ($$self.$$.dirty & /*r, $rGet*/ 8454144) {
    			 $$invalidate(5, rGetter = r === "r" ? $rGet : $rGet);
    		}

    		if ($$self.$$.dirty & /*$width, $height, xGetter, yGetter, dataset, $data*/ 234889240) {
    			 finder = quadtree().extent([[-1, -1], [$width + 1, $height + 1]]).x(xGetter).y(yGetter).addAll(dataset || $data);
    		}
    	};

    	return [
    		visible,
    		found,
    		e,
    		xGetter,
    		yGetter,
    		rGetter,
    		data,
    		xGet,
    		yGet,
    		rGet,
    		width,
    		height,
    		findItem,
    		dataset,
    		x,
    		y,
    		r,
    		searchRadius,
    		$$scope,
    		$$slots,
    		mouseout_handler
    	];
    }

    class QuadTree extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$6, create_fragment$6, safe_not_equal, {
    			dataset: 13,
    			x: 14,
    			y: 15,
    			r: 16,
    			searchRadius: 17
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "QuadTree",
    			options,
    			id: create_fragment$6.name
    		});
    	}

    	get dataset() {
    		throw new Error("<QuadTree>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set dataset(value) {
    		throw new Error("<QuadTree>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get x() {
    		throw new Error("<QuadTree>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set x(value) {
    		throw new Error("<QuadTree>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get y() {
    		throw new Error("<QuadTree>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set y(value) {
    		throw new Error("<QuadTree>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get r() {
    		throw new Error("<QuadTree>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set r(value) {
    		throw new Error("<QuadTree>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get searchRadius() {
    		throw new Error("<QuadTree>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set searchRadius(value) {
    		throw new Error("<QuadTree>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    function cubicInOut(t) {
        return t < 0.5 ? 4.0 * t * t * t : 0.5 * Math.pow(2.0 * t - 2.0, 3.0) + 1.0;
    }

    function is_date(obj) {
        return Object.prototype.toString.call(obj) === '[object Date]';
    }

    function get_interpolator(a, b) {
        if (a === b || a !== a)
            return () => a;
        const type = typeof a;
        if (type !== typeof b || Array.isArray(a) !== Array.isArray(b)) {
            throw new Error('Cannot interpolate values of different type');
        }
        if (Array.isArray(a)) {
            const arr = b.map((bi, i) => {
                return get_interpolator(a[i], bi);
            });
            return t => arr.map(fn => fn(t));
        }
        if (type === 'object') {
            if (!a || !b)
                throw new Error('Object cannot be null');
            if (is_date(a) && is_date(b)) {
                a = a.getTime();
                b = b.getTime();
                const delta = b - a;
                return t => new Date(a + t * delta);
            }
            const keys = Object.keys(b);
            const interpolators = {};
            keys.forEach(key => {
                interpolators[key] = get_interpolator(a[key], b[key]);
            });
            return t => {
                const result = {};
                keys.forEach(key => {
                    result[key] = interpolators[key](t);
                });
                return result;
            };
        }
        if (type === 'number') {
            const delta = b - a;
            return t => a + t * delta;
        }
        throw new Error(`Cannot interpolate ${type} values`);
    }
    function tweened(value, defaults = {}) {
        const store = writable(value);
        let task;
        let target_value = value;
        function set(new_value, opts) {
            if (value == null) {
                store.set(value = new_value);
                return Promise.resolve();
            }
            target_value = new_value;
            let previous_task = task;
            let started = false;
            let { delay = 0, duration = 400, easing = identity, interpolate = get_interpolator } = assign(assign({}, defaults), opts);
            if (duration === 0) {
                if (previous_task) {
                    previous_task.abort();
                    previous_task = null;
                }
                store.set(value = target_value);
                return Promise.resolve();
            }
            const start = now() + delay;
            let fn;
            task = loop(now => {
                if (now < start)
                    return true;
                if (!started) {
                    fn = interpolate(value, new_value);
                    if (typeof duration === 'function')
                        duration = duration(value, new_value);
                    started = true;
                }
                if (previous_task) {
                    previous_task.abort();
                    previous_task = null;
                }
                const elapsed = now - start;
                if (elapsed > duration) {
                    store.set(value = new_value);
                    return false;
                }
                // @ts-ignore
                store.set(value = fn(easing(elapsed / duration)));
                return true;
            });
            return task.promise;
        }
        return {
            set,
            update: (fn, opts) => set(fn(target_value, value), opts),
            subscribe: store.subscribe
        };
    }

    var points = [ { "Occupation title":"Chief executives and senior officials",
        "Proximity to others":"48.7",
        "Exposure to disease":"11.7",
        "Total in employment":"101000" },
      { "Occupation title":"Production managers and directors in manufacturing",
        "Proximity to others":"48.0",
        "Exposure to disease":"7.5",
        "Total in employment":"313000" },
      { "Occupation title":"Production managers and directors in construction",
        "Proximity to others":"50.0",
        "Exposure to disease":"4.0",
        "Total in employment":"210000" },
      { "Occupation title":"Production managers and directors in mining and energy",
        "Proximity to others":"49.3",
        "Exposure to disease":"9.0",
        "Total in employment":"19000" },
      { "Occupation title":"Financial managers and directors",
        "Proximity to others":"44.0",
        "Exposure to disease":"5.5",
        "Total in employment":"352000" },
      { "Occupation title":"Marketing and sales directors",
        "Proximity to others":"47.5",
        "Exposure to disease":"2.5",
        "Total in employment":"270000" },
      { "Occupation title":"Purchasing managers and directors",
        "Proximity to others":"47.3",
        "Exposure to disease":"5.3",
        "Total in employment":"64000" },
      { "Occupation title":"Advertising and public relations directors",
        "Proximity to others":"42.0",
        "Exposure to disease":"7.0",
        "Total in employment":"45000" },
      { "Occupation title":"Human resource managers and directors",
        "Proximity to others":"39.7",
        "Exposure to disease":"4.3",
        "Total in employment":"217000" },
      { "Occupation title":"Information technology and telecommunications directors",
        "Proximity to others":"41.0",
        "Exposure to disease":"1.0",
        "Total in employment":"120000" },
      { "Occupation title":"Functional managers and directors n.e.c.",
        "Proximity to others":"49.3",
        "Exposure to disease":"9.0",
        "Total in employment":"127000" },
      { "Occupation title":"Financial institution managers and directors",
        "Proximity to others":"47.7",
        "Exposure to disease":"8.3",
        "Total in employment":"88000" },
      { "Occupation title":"Managers and directors in transport and distribution",
        "Proximity to others":"47.3",
        "Exposure to disease":"5.3",
        "Total in employment":"83000" },
      { "Occupation title":"Managers and directors in storage and warehousing",
        "Proximity to others":"47.3",
        "Exposure to disease":"5.3",
        "Total in employment":"113000" },
      { "Occupation title":"Senior police officers",
        "Proximity to others":"70.2",
        "Exposure to disease":"49.0",
        "Total in employment":"10000" },
      { "Occupation title":"Senior officers in fire, ambulance, prison and related services",
        "Proximity to others":"49.3",
        "Exposure to disease":"9.0",
        "Total in employment":"11000" },
      { "Occupation title":"Health services and public health managers and directors",
        "Proximity to others":"45.0",
        "Exposure to disease":"34.0",
        "Total in employment":"74000" },
      { "Occupation title":"Social services managers and directors",
        "Proximity to others":"42.0",
        "Exposure to disease":"26.0",
        "Total in employment":"34000" },
      { "Occupation title":"Managers and directors in retail and wholesale",
        "Proximity to others":"55.0",
        "Exposure to disease":"14.0",
        "Total in employment":"345000" },
      { "Occupation title":"Managers and proprietors in agriculture and horticulture",
        "Proximity to others":"55.7",
        "Exposure to disease":"4.7",
        "Total in employment":"24000" },
      { "Occupation title":"Managers and proprietors in forestry, fishing and related services",
        "Proximity to others":"55.7",
        "Exposure to disease":"4.7",
        "Total in employment":"12000" },
      { "Occupation title":"Hotel and accommodation managers and proprietors",
        "Proximity to others":"49.0",
        "Exposure to disease":"4.0",
        "Total in employment":"58000" },
      { "Occupation title":"Restaurant and catering establishment managers and proprietors",
        "Proximity to others":"78.0",
        "Exposure to disease":"10.0",
        "Total in employment":"144000" },
      { "Occupation title":"Publicans and managers of licensed premises",
        "Proximity to others":"49.0",
        "Exposure to disease":"4.0",
        "Total in employment":"40000" },
      { "Occupation title":"Leisure and sports managers",
        "Proximity to others":"52.0",
        "Exposure to disease":"9.8",
        "Total in employment":"59000" },
      { "Occupation title":"Travel agency managers and proprietors",
        "Proximity to others":"49.3",
        "Exposure to disease":"9.0",
        "Total in employment":"7000" },
      { "Occupation title":"Health care practice managers",
        "Proximity to others":"56.5",
        "Exposure to disease":"37.0",
        "Total in employment":"26000" },
      { "Occupation title":"Residential, day and domiciliary  care managers and proprietors",
        "Proximity to others":"50.0",
        "Exposure to disease":"24.0",
        "Total in employment":"63000" },
      { "Occupation title":"Property, housing and estate managers",
        "Proximity to others":"49.3",
        "Exposure to disease":"9.0",
        "Total in employment":"198000" },
      { "Occupation title":"Garage managers and proprietors",
        "Proximity to others":"49.3",
        "Exposure to disease":"9.0",
        "Total in employment":"26000" },
      { "Occupation title":"Hairdressing and beauty salon managers and proprietors",
        "Proximity to others":"49.3",
        "Exposure to disease":"9.0",
        "Total in employment":"25000" },
      { "Occupation title":"Shopkeepers and proprietors � wholesale and retail",
        "Proximity to others":"55.0",
        "Exposure to disease":"14.0",
        "Total in employment":"117000" },
      { "Occupation title":"Waste disposal and environmental services managers",
        "Proximity to others":"49.3",
        "Exposure to disease":"9.0",
        "Total in employment":"17000" },
      { "Occupation title":"Managers and proprietors in other services n.e.c.",
        "Proximity to others":"49.3",
        "Exposure to disease":"9.0",
        "Total in employment":"230000" },
      { "Occupation title":"Chemical scientists",
        "Proximity to others":"51.5",
        "Exposure to disease":"12.5",
        "Total in employment":"25000" },
      { "Occupation title":"Biological scientists and biochemists",
        "Proximity to others":"44.8",
        "Exposure to disease":"30.5",
        "Total in employment":"80000" },
      { "Occupation title":"Physical scientists",
        "Proximity to others":"39.3",
        "Exposure to disease":"4.8",
        "Total in employment":"28000" },
      { "Occupation title":"Social and humanities scientists",
        "Proximity to others":"51.3",
        "Exposure to disease":"10.0",
        "Total in employment":"29000" },
      { "Occupation title":"Natural and social science professionals n.e.c.",
        "Proximity to others":"44.8",
        "Exposure to disease":"30.5",
        "Total in employment":"62000" },
      { "Occupation title":"Civil engineers",
        "Proximity to others":"46.5",
        "Exposure to disease":"4.5",
        "Total in employment":"88000" },
      { "Occupation title":"Mechanical engineers",
        "Proximity to others":"51.6",
        "Exposure to disease":"2.6",
        "Total in employment":"78000" },
      { "Occupation title":"Electrical engineers",
        "Proximity to others":"48.0",
        "Exposure to disease":"1.0",
        "Total in employment":"54000" },
      { "Occupation title":"Electronics engineers",
        "Proximity to others":"46.7",
        "Exposure to disease":"3.0",
        "Total in employment":"32000" },
      { "Occupation title":"Design and development engineers",
        "Proximity to others":"49.1",
        "Exposure to disease":"8.0",
        "Total in employment":"78000" },
      { "Occupation title":"Production and process engineers",
        "Proximity to others":"52.0",
        "Exposure to disease":"3.5",
        "Total in employment":"48000" },
      { "Occupation title":"Engineering professionals n.e.c.",
        "Proximity to others":"49.1",
        "Exposure to disease":"8.0",
        "Total in employment":"130000" },
      { "Occupation title":"IT business analysts, architects and systems designers",
        "Proximity to others":"47.0",
        "Exposure to disease":"17.3",
        "Total in employment":"148000" },
      { "Occupation title":"Programmers and software development professionals",
        "Proximity to others":"47.5",
        "Exposure to disease":"0.0",
        "Total in employment":"388000" },
      { "Occupation title":"Conservation professionals",
        "Proximity to others":"48.3",
        "Exposure to disease":"6.6",
        "Total in employment":"15000" },
      { "Occupation title":"Environment professionals",
        "Proximity to others":"48.3",
        "Exposure to disease":"6.6",
        "Total in employment":"43000" },
      { "Occupation title":"Research and development managers",
        "Proximity to others":"43.6",
        "Exposure to disease":"11.0",
        "Total in employment":"55000" },
      { "Occupation title":"Medical practitioners",
        "Proximity to others":"89.2",
        "Exposure to disease":"91.2",
        "Total in employment":"296000" },
      { "Occupation title":"Psychologists",
        "Proximity to others":"55.2",
        "Exposure to disease":"32.6",
        "Total in employment":"36000" },
      { "Occupation title":"Pharmacists",
        "Proximity to others":"72.0",
        "Exposure to disease":"76.0",
        "Total in employment":"70000" },
      { "Occupation title":"Ophthalmic opticians",
        "Proximity to others":"90.0",
        "Exposure to disease":"75.0",
        "Total in employment":"18000" },
      { "Occupation title":"Dental practitioners",
        "Proximity to others":"97.0",
        "Exposure to disease":"90.0",
        "Total in employment":"41000" },
      { "Occupation title":"Veterinarians",
        "Proximity to others":"91.0",
        "Exposure to disease":"89.0",
        "Total in employment":"27000" },
      { "Occupation title":"Medical radiographers",
        "Proximity to others":"88.8",
        "Exposure to disease":"89.8",
        "Total in employment":"34000" },
      { "Occupation title":"Podiatrists",
        "Proximity to others":"84.9",
        "Exposure to disease":"67.8",
        "Total in employment":"12000" },
      { "Occupation title":"Health professionals n.e.c.",
        "Proximity to others":"84.9",
        "Exposure to disease":"67.8",
        "Total in employment":"64000" },
      { "Occupation title":"Physiotherapists",
        "Proximity to others":"96.5",
        "Exposure to disease":"61.0",
        "Total in employment":"73000" },
      { "Occupation title":"Occupational therapists",
        "Proximity to others":"84.9",
        "Exposure to disease":"67.8",
        "Total in employment":"47000" },
      { "Occupation title":"Speech and language therapists",
        "Proximity to others":"73.0",
        "Exposure to disease":"60.0",
        "Total in employment":"20000" },
      { "Occupation title":"Therapy professionals n.e.c.",
        "Proximity to others":"55.2",
        "Exposure to disease":"32.6",
        "Total in employment":"63000" },
      { "Occupation title":"Nurses",
        "Proximity to others":"86.0",
        "Exposure to disease":"91.5",
        "Total in employment":"669000" },
      { "Occupation title":"Midwives",
        "Proximity to others":"97.0",
        "Exposure to disease":"89.0",
        "Total in employment":"45000" },
      { "Occupation title":"Higher education teaching professionals",
        "Proximity to others":"50.7",
        "Exposure to disease":"11.1",
        "Total in employment":"178000" },
      { "Occupation title":"Further education teaching professionals",
        "Proximity to others":"77.0",
        "Exposure to disease":"23.7",
        "Total in employment":"127000" },
      { "Occupation title":"Secondary education teaching professionals",
        "Proximity to others":"70.0",
        "Exposure to disease":"17.0",
        "Total in employment":"395000" },
      { "Occupation title":"Primary and nursery education teaching professionals",
        "Proximity to others":"74.5",
        "Exposure to disease":"50.0",
        "Total in employment":"437000" },
      { "Occupation title":"Special needs education teaching professionals",
        "Proximity to others":"83.0",
        "Exposure to disease":"48.8",
        "Total in employment":"86000" },
      { "Occupation title":"Senior professionals of educational establishments",
        "Proximity to others":"50.8",
        "Exposure to disease":"14.3",
        "Total in employment":"96000" },
      { "Occupation title":"Education advisers and school inspectors",
        "Proximity to others":"51.5",
        "Exposure to disease":"8.5",
        "Total in employment":"35000" },
      { "Occupation title":"Teaching and other educational professionals n.e.c.",
        "Proximity to others":"64.0",
        "Exposure to disease":"36.0",
        "Total in employment":"253000" },
      { "Occupation title":"Barristers and judges",
        "Proximity to others":"34.0",
        "Exposure to disease":"14.0",
        "Total in employment":"30000" },
      { "Occupation title":"Solicitors",
        "Proximity to others":"34.0",
        "Exposure to disease":"14.0",
        "Total in employment":"122000" },
      { "Occupation title":"Legal professionals n.e.c.",
        "Proximity to others":"34.0",
        "Exposure to disease":"14.0",
        "Total in employment":"60000" },
      { "Occupation title":"Chartered and certified accountants",
        "Proximity to others":"47.5",
        "Exposure to disease":"2.8",
        "Total in employment":"185000" },
      { "Occupation title":"Management consultants and business analysts",
        "Proximity to others":"49.8",
        "Exposure to disease":"4.3",
        "Total in employment":"198000" },
      { "Occupation title":"Business and financial project management professionals",
        "Proximity to others":"49.8",
        "Exposure to disease":"4.3",
        "Total in employment":"272000" },
      { "Occupation title":"Actuaries, economists and statisticians",
        "Proximity to others":"39.0",
        "Exposure to disease":"2.1",
        "Total in employment":"56000" },
      { "Occupation title":"Business and related research professionals",
        "Proximity to others":"51.5",
        "Exposure to disease":"4.2",
        "Total in employment":"54000" },
      { "Occupation title":"Business, research and administrative professionals n.e.c.",
        "Proximity to others":"51.5",
        "Exposure to disease":"4.2",
        "Total in employment":"75000" },
      { "Occupation title":"Architects",
        "Proximity to others":"53.0",
        "Exposure to disease":"2.0",
        "Total in employment":"55000" },
      { "Occupation title":"Town planning officers",
        "Proximity to others":"54.0",
        "Exposure to disease":"6.0",
        "Total in employment":"19000" },
      { "Occupation title":"Quantity surveyors",
        "Proximity to others":"49.1",
        "Exposure to disease":"8.0",
        "Total in employment":"54000" },
      { "Occupation title":"Chartered surveyors",
        "Proximity to others":"47.3",
        "Exposure to disease":"4.7",
        "Total in employment":"61000" },
      { "Occupation title":"Chartered architectural technologists",
        "Proximity to others":"53.0",
        "Exposure to disease":"2.0",
        "Total in employment":"6000" },
      { "Occupation title":"Construction project managers and related professionals",
        "Proximity to others":"50.0",
        "Exposure to disease":"4.0",
        "Total in employment":"83000" },
      { "Occupation title":"Social workers",
        "Proximity to others":"60.4",
        "Exposure to disease":"46.4",
        "Total in employment":"111000" },
      { "Occupation title":"Probation officers",
        "Proximity to others":"60.4",
        "Exposure to disease":"46.4",
        "Total in employment":"13000" },
      { "Occupation title":"Clergy",
        "Proximity to others":"51.5",
        "Exposure to disease":"26.5",
        "Total in employment":"48000" },
      { "Occupation title":"Welfare professionals n.e.c.",
        "Proximity to others":"60.4",
        "Exposure to disease":"46.4",
        "Total in employment":"30000" },
      { "Occupation title":"Librarians",
        "Proximity to others":"55.5",
        "Exposure to disease":"17.0",
        "Total in employment":"20000" },
      { "Occupation title":"Archivists and curators",
        "Proximity to others":"44.0",
        "Exposure to disease":"3.5",
        "Total in employment":"17000" },
      { "Occupation title":"Quality control and planning engineers",
        "Proximity to others":"49.1",
        "Exposure to disease":"8.0",
        "Total in employment":"35000" },
      { "Occupation title":"Quality assurance and regulatory professionals",
        "Proximity to others":"49.8",
        "Exposure to disease":"4.3",
        "Total in employment":"107000" },
      { "Occupation title":"Environmental health professionals",
        "Proximity to others":"64.5",
        "Exposure to disease":"34.0",
        "Total in employment":"10000" },
      { "Occupation title":"Journalists, newspaper and periodical editors",
        "Proximity to others":"54.5",
        "Exposure to disease":"4.5",
        "Total in employment":"80000" },
      { "Occupation title":"Public relations professionals",
        "Proximity to others":"46.0",
        "Exposure to disease":"4.0",
        "Total in employment":"67000" },
      { "Occupation title":"Advertising accounts managers and creative directors",
        "Proximity to others":"33.0",
        "Exposure to disease":"2.3",
        "Total in employment":"39000" },
      { "Occupation title":"Laboratory technicians",
        "Proximity to others":"50.7",
        "Exposure to disease":"4.2",
        "Total in employment":"73000" },
      { "Occupation title":"Electrical and electronics technicians",
        "Proximity to others":"57.3",
        "Exposure to disease":"6.5",
        "Total in employment":"35000" },
      { "Occupation title":"Engineering technicians",
        "Proximity to others":"55.8",
        "Exposure to disease":"5.4",
        "Total in employment":"100000" },
      { "Occupation title":"Building and civil engineering technicians",
        "Proximity to others":"63.9",
        "Exposure to disease":"29.8",
        "Total in employment":"22000" },
      { "Occupation title":"Quality assurance technicians",
        "Proximity to others":"58.1",
        "Exposure to disease":"16.1",
        "Total in employment":"34000" },
      { "Occupation title":"Planning, process and production technicians",
        "Proximity to others":"57.0",
        "Exposure to disease":"1.0",
        "Total in employment":"27000" },
      { "Occupation title":"Science, engineering and production technicians n.e.c.",
        "Proximity to others":"58.1",
        "Exposure to disease":"16.1",
        "Total in employment":"49000" },
      { "Occupation title":"Architectural and town planning technicians",
        "Proximity to others":"63.9",
        "Exposure to disease":"29.8",
        "Total in employment":"23000" },
      { "Occupation title":"Draughtspersons",
        "Proximity to others":"41.8",
        "Exposure to disease":"1.5",
        "Total in employment":"38000" },
      { "Occupation title":"IT operations technicians",
        "Proximity to others":"42.0",
        "Exposure to disease":"7.0",
        "Total in employment":"108000" },
      { "Occupation title":"Paramedics",
        "Proximity to others":"97.0",
        "Exposure to disease":"89.0",
        "Total in employment":"28000" },
      { "Occupation title":"Dispensing opticians",
        "Proximity to others":"83.0",
        "Exposure to disease":"40.0",
        "Total in employment":"9000" },
      { "Occupation title":"Pharmaceutical technicians",
        "Proximity to others":"83.0",
        "Exposure to disease":"72.0",
        "Total in employment":"33000" },
      { "Occupation title":"Medical and dental technicians",
        "Proximity to others":"88.8",
        "Exposure to disease":"89.8",
        "Total in employment":"42000" },
      { "Occupation title":"Youth and community workers",
        "Proximity to others":"79.0",
        "Exposure to disease":"58.0",
        "Total in employment":"74000" },
      { "Occupation title":"Child and early years officers",
        "Proximity to others":"79.0",
        "Exposure to disease":"58.0",
        "Total in employment":"43000" },
      { "Occupation title":"Housing officers",
        "Proximity to others":"79.0",
        "Exposure to disease":"58.0",
        "Total in employment":"54000" },
      { "Occupation title":"Counsellors",
        "Proximity to others":"60.4",
        "Exposure to disease":"46.4",
        "Total in employment":"26000" },
      { "Occupation title":"Welfare and housing associate professionals n.e.c.",
        "Proximity to others":"79.0",
        "Exposure to disease":"58.0",
        "Total in employment":"142000" },
      { "Occupation title":"Police officers (sergeant and below)",
        "Proximity to others":"77.0",
        "Exposure to disease":"62.8",
        "Total in employment":"153000" },
      { "Occupation title":"Fire service officers (watch manager and below)",
        "Proximity to others":"78.0",
        "Exposure to disease":"53.8",
        "Total in employment":"44000" },
      { "Occupation title":"Prison service officers (below principal officer)",
        "Proximity to others":"76.0",
        "Exposure to disease":"78.5",
        "Total in employment":"42000" },
      { "Occupation title":"Police community support officers",
        "Proximity to others":"77.0",
        "Exposure to disease":"62.8",
        "Total in employment":"13000" },
      { "Occupation title":"Protective service associate professionals n.e.c.",
        "Proximity to others":"62.0",
        "Exposure to disease":"28.4",
        "Total in employment":"63000" },
      { "Occupation title":"Artists",
        "Proximity to others":"21.5",
        "Exposure to disease":"1.0",
        "Total in employment":"60000" },
      { "Occupation title":"Authors, writers and translators",
        "Proximity to others":"39.8",
        "Exposure to disease":"1.8",
        "Total in employment":"91000" },
      { "Occupation title":"Actors, entertainers and presenters",
        "Proximity to others":"95.0",
        "Exposure to disease":"5.0",
        "Total in employment":"54000" },
      { "Occupation title":"Dancers and choreographers",
        "Proximity to others":"76.0",
        "Exposure to disease":"8.0",
        "Total in employment":"23000" },
      { "Occupation title":"Musicians",
        "Proximity to others":"67.3",
        "Exposure to disease":"13.3",
        "Total in employment":"54000" },
      { "Occupation title":"Arts officers, producers and directors",
        "Proximity to others":"55.9",
        "Exposure to disease":"1.4",
        "Total in employment":"100000" },
      { "Occupation title":"Photographers, audio-visual and broadcasting equipment operators",
        "Proximity to others":"65.0",
        "Exposure to disease":"6.0",
        "Total in employment":"73000" },
      { "Occupation title":"Graphic designers",
        "Proximity to others":"43.5",
        "Exposure to disease":"0.0",
        "Total in employment":"89000" },
      { "Occupation title":"Product, clothing and related designers",
        "Proximity to others":"53.1",
        "Exposure to disease":"1.7",
        "Total in employment":"83000" },
      { "Occupation title":"Sports players",
        "Proximity to others":"59.0",
        "Exposure to disease":"6.0",
        "Total in employment":"14000" },
      { "Occupation title":"Sports coaches, instructors and officials",
        "Proximity to others":"73.7",
        "Exposure to disease":"9.3",
        "Total in employment":"97000" },
      { "Occupation title":"Fitness instructors",
        "Proximity to others":"84.2",
        "Exposure to disease":"27.8",
        "Total in employment":"68000" },
      { "Occupation title":"Air traffic controllers",
        "Proximity to others":"74.0",
        "Exposure to disease":"11.5",
        "Total in employment":"8000" },
      { "Occupation title":"Aircraft pilots and flight engineers",
        "Proximity to others":"76.7",
        "Exposure to disease":"23.0",
        "Total in employment":"26000" },
      { "Occupation title":"Ship and hovercraft officers",
        "Proximity to others":"70.0",
        "Exposure to disease":"18.0",
        "Total in employment":"14000" },
      { "Occupation title":"Legal associate professionals",
        "Proximity to others":"55.2",
        "Exposure to disease":"13.5",
        "Total in employment":"74000" },
      { "Occupation title":"Estimators, valuers and assessors",
        "Proximity to others":"46.4",
        "Exposure to disease":"4.2",
        "Total in employment":"62000" },
      { "Occupation title":"Brokers",
        "Proximity to others":"50.0",
        "Exposure to disease":"2.8",
        "Total in employment":"53000" },
      { "Occupation title":"Insurance underwriters",
        "Proximity to others":"52.0",
        "Exposure to disease":"5.0",
        "Total in employment":"29000" },
      { "Occupation title":"Finance and investment analysts and advisers",
        "Proximity to others":"42.0",
        "Exposure to disease":"1.0",
        "Total in employment":"219000" },
      { "Occupation title":"Taxation experts",
        "Proximity to others":"47.5",
        "Exposure to disease":"2.8",
        "Total in employment":"35000" },
      { "Occupation title":"Importers and exporters",
        "Proximity to others":"54.2",
        "Exposure to disease":"2.7",
        "Total in employment":"6000" },
      { "Occupation title":"Financial and accounting technicians",
        "Proximity to others":"45.8",
        "Exposure to disease":"3.4",
        "Total in employment":"23000" },
      { "Occupation title":"Financial accounts managers",
        "Proximity to others":"44.0",
        "Exposure to disease":"4.0",
        "Total in employment":"176000" },
      { "Occupation title":"Business and related associate professionals n.e.c.",
        "Proximity to others":"49.3",
        "Exposure to disease":"4.5",
        "Total in employment":"184000" },
      { "Occupation title":"Buyers and procurement officers",
        "Proximity to others":"48.7",
        "Exposure to disease":"4.0",
        "Total in employment":"59000" },
      { "Occupation title":"Business sales executives",
        "Proximity to others":"48.0",
        "Exposure to disease":"5.6",
        "Total in employment":"131000" },
      { "Occupation title":"Marketing associate professionals",
        "Proximity to others":"33.0",
        "Exposure to disease":"2.3",
        "Total in employment":"203000" },
      { "Occupation title":"Estate agents and auctioneers",
        "Proximity to others":"54.8",
        "Exposure to disease":"4.0",
        "Total in employment":"53000" },
      { "Occupation title":"Sales accounts and business development managers",
        "Proximity to others":"45.3",
        "Exposure to disease":"5.3",
        "Total in employment":"451000" },
      { "Occupation title":"Conference and exhibition managers and organisers",
        "Proximity to others":"72.0",
        "Exposure to disease":"0.0",
        "Total in employment":"63000" },
      { "Occupation title":"Conservation and environmental associate professionals",
        "Proximity to others":"68.0",
        "Exposure to disease":"15.0",
        "Total in employment":"11000" },
      { "Occupation title":"Public services associate professionals",
        "Proximity to others":"68.0",
        "Exposure to disease":"18.0",
        "Total in employment":"93000" },
      { "Occupation title":"Human resources and industrial relations officers",
        "Proximity to others":"45.7",
        "Exposure to disease":"14.7",
        "Total in employment":"160000" },
      { "Occupation title":"Vocational and industrial trainers and instructors",
        "Proximity to others":"59.0",
        "Exposure to disease":"2.0",
        "Total in employment":"155000" },
      { "Occupation title":"Careers advisers and vocational guidance specialists",
        "Proximity to others":"45.7",
        "Exposure to disease":"14.7",
        "Total in employment":"33000" },
      { "Occupation title":"Inspectors of standards and regulations",
        "Proximity to others":"68.0",
        "Exposure to disease":"18.0",
        "Total in employment":"45000" },
      { "Occupation title":"Health and safety officers",
        "Proximity to others":"62.2",
        "Exposure to disease":"13.8",
        "Total in employment":"60000" },
      { "Occupation title":"National government administrative occupations",
        "Proximity to others":"59.1",
        "Exposure to disease":"29.1",
        "Total in employment":"141000" },
      { "Occupation title":"Local government administrative occupations",
        "Proximity to others":"57.5",
        "Exposure to disease":"19.0",
        "Total in employment":"143000" },
      { "Occupation title":"Officers of non-governmental organisations",
        "Proximity to others":"57.5",
        "Exposure to disease":"19.0",
        "Total in employment":"38000" },
      { "Occupation title":"Credit controllers",
        "Proximity to others":"43.3",
        "Exposure to disease":"6.3",
        "Total in employment":"35000" },
      { "Occupation title":"Book-keepers, payroll managers and wages clerks",
        "Proximity to others":"54.0",
        "Exposure to disease":"11.0",
        "Total in employment":"428000" },
      { "Occupation title":"Bank and post office clerks",
        "Proximity to others":"79.0",
        "Exposure to disease":"25.5",
        "Total in employment":"97000" },
      { "Occupation title":"Finance officers",
        "Proximity to others":"54.0",
        "Exposure to disease":"11.0",
        "Total in employment":"36000" },
      { "Occupation title":"Financial administrative occupations n.e.c.",
        "Proximity to others":"79.0",
        "Exposure to disease":"25.5",
        "Total in employment":"161000" },
      { "Occupation title":"Records clerks and assistants",
        "Proximity to others":"56.0",
        "Exposure to disease":"30.0",
        "Total in employment":"110000" },
      { "Occupation title":"Pensions and insurance clerks and assistants",
        "Proximity to others":"56.3",
        "Exposure to disease":"5.3",
        "Total in employment":"63000" },
      { "Occupation title":"Stock control clerks and assistants",
        "Proximity to others":"63.3",
        "Exposure to disease":"9.7",
        "Total in employment":"87000" },
      { "Occupation title":"Transport and distribution clerks and assistants",
        "Proximity to others":"58.0",
        "Exposure to disease":"9.0",
        "Total in employment":"60000" },
      { "Occupation title":"Library clerks and assistants",
        "Proximity to others":"67.5",
        "Exposure to disease":"25.0",
        "Total in employment":"24000" },
      { "Occupation title":"Human resources administrative occupations",
        "Proximity to others":"53.0",
        "Exposure to disease":"14.0",
        "Total in employment":"29000" },
      { "Occupation title":"Sales administrators",
        "Proximity to others":"68.0",
        "Exposure to disease":"10.0",
        "Total in employment":"75000" },
      { "Occupation title":"Other administrative occupations n.e.c.",
        "Proximity to others":"49.5",
        "Exposure to disease":"3.0",
        "Total in employment":"740000" },
      { "Occupation title":"Office managers",
        "Proximity to others":"47.0",
        "Exposure to disease":"9.0",
        "Total in employment":"178000" },
      { "Occupation title":"Office supervisors",
        "Proximity to others":"47.0",
        "Exposure to disease":"9.0",
        "Total in employment":"35000" },
      { "Occupation title":"Medical secretaries",
        "Proximity to others":"56.5",
        "Exposure to disease":"37.0",
        "Total in employment":"64000" },
      { "Occupation title":"Legal secretaries",
        "Proximity to others":"41.0",
        "Exposure to disease":"0.0",
        "Total in employment":"39000" },
      { "Occupation title":"School secretaries",
        "Proximity to others":"50.0",
        "Exposure to disease":"10.5",
        "Total in employment":"72000" },
      { "Occupation title":"Company secretaries",
        "Proximity to others":"44.0",
        "Exposure to disease":"5.5",
        "Total in employment":"30000" },
      { "Occupation title":"Personal assistants and other secretaries",
        "Proximity to others":"50.0",
        "Exposure to disease":"10.5",
        "Total in employment":"173000" },
      { "Occupation title":"Receptionists",
        "Proximity to others":"52.0",
        "Exposure to disease":"31.0",
        "Total in employment":"237000" },
      { "Occupation title":"Typists and related keyboard occupations",
        "Proximity to others":"57.0",
        "Exposure to disease":"11.0",
        "Total in employment":"36000" },
      { "Occupation title":"Farmers",
        "Proximity to others":"43.0",
        "Exposure to disease":"17.2",
        "Total in employment":"125000" },
      { "Occupation title":"Horticultural trades",
        "Proximity to others":"56.7",
        "Exposure to disease":"6.0",
        "Total in employment":"17000" },
      { "Occupation title":"Gardeners and landscape gardeners",
        "Proximity to others":"56.7",
        "Exposure to disease":"6.0",
        "Total in employment":"172000" },
      { "Occupation title":"Groundsmen and greenkeepers",
        "Proximity to others":"56.7",
        "Exposure to disease":"6.0",
        "Total in employment":"31000" },
      { "Occupation title":"Agricultural and fishing trades n.e.c.",
        "Proximity to others":"39.8",
        "Exposure to disease":"9.8",
        "Total in employment":"33000" },
      { "Occupation title":"Smiths and forge workers",
        "Proximity to others":"65.0",
        "Exposure to disease":"1.0",
        "Total in employment":"4000" },
      { "Occupation title":"Moulders, core makers and die casters",
        "Proximity to others":"68.5",
        "Exposure to disease":"5.5",
        "Total in employment":"2000" },
      { "Occupation title":"Sheet metal workers",
        "Proximity to others":"64.3",
        "Exposure to disease":"12.7",
        "Total in employment":"16000" },
      { "Occupation title":"Metal plate workers, and riveters",
        "Proximity to others":"72.7",
        "Exposure to disease":"9.7",
        "Total in employment":"6000" },
      { "Occupation title":"Welding trades",
        "Proximity to others":"46.7",
        "Exposure to disease":"0.3",
        "Total in employment":"61000" },
      { "Occupation title":"Pipe fitters",
        "Proximity to others":"73.3",
        "Exposure to disease":"38.3",
        "Total in employment":"5000" },
      { "Occupation title":"Metal machining setters and setter-operators",
        "Proximity to others":"53.6",
        "Exposure to disease":"4.5",
        "Total in employment":"53000" },
      { "Occupation title":"Tool makers, tool fitters and markers-out",
        "Proximity to others":"61.3",
        "Exposure to disease":"6.8",
        "Total in employment":"13000" },
      { "Occupation title":"Metal working production and maintenance fitters",
        "Proximity to others":"68.4",
        "Exposure to disease":"15.4",
        "Total in employment":"223000" },
      { "Occupation title":"Precision instrument makers and repairers",
        "Proximity to others":"56.3",
        "Exposure to disease":"13.3",
        "Total in employment":"22000" },
      { "Occupation title":"Air-conditioning and refrigeration engineers",
        "Proximity to others":"63.7",
        "Exposure to disease":"17.7",
        "Total in employment":"16000" },
      { "Occupation title":"Vehicle technicians, mechanics and electricians",
        "Proximity to others":"55.7",
        "Exposure to disease":"10.0",
        "Total in employment":"178000" },
      { "Occupation title":"Vehicle body builders and repairers",
        "Proximity to others":"60.0",
        "Exposure to disease":"11.3",
        "Total in employment":"24000" },
      { "Occupation title":"Vehicle paint technicians",
        "Proximity to others":"61.0",
        "Exposure to disease":"8.0",
        "Total in employment":"13000" },
      { "Occupation title":"Aircraft maintenance and related trades",
        "Proximity to others":"61.5",
        "Exposure to disease":"11.5",
        "Total in employment":"29000" },
      { "Occupation title":"Boat and ship builders and repairers",
        "Proximity to others":"68.4",
        "Exposure to disease":"15.4",
        "Total in employment":"15000" },
      { "Occupation title":"Rail and rolling stock builders and repairers",
        "Proximity to others":"68.4",
        "Exposure to disease":"15.4",
        "Total in employment":"10000" },
      { "Occupation title":"Electricians and electrical fitters",
        "Proximity to others":"71.5",
        "Exposure to disease":"6.5",
        "Total in employment":"259000" },
      { "Occupation title":"Telecommunications engineers",
        "Proximity to others":"48.0",
        "Exposure to disease":"4.5",
        "Total in employment":"60000" },
      { "Occupation title":"TV, video and audio engineers",
        "Proximity to others":"57.0",
        "Exposure to disease":"6.0",
        "Total in employment":"8000" },
      { "Occupation title":"IT engineers",
        "Proximity to others":"61.4",
        "Exposure to disease":"14.8",
        "Total in employment":"37000" },
      { "Occupation title":"Electrical and electronic trades n.e.c.",
        "Proximity to others":"57.0",
        "Exposure to disease":"6.0",
        "Total in employment":"79000" },
      { "Occupation title":"Skilled metal, electrical and electronic trades supervisors",
        "Proximity to others":"65.0",
        "Exposure to disease":"1.0",
        "Total in employment":"40000" },
      { "Occupation title":"Steel erectors",
        "Proximity to others":"72.7",
        "Exposure to disease":"9.7",
        "Total in employment":"7000" },
      { "Occupation title":"Bricklayers and masons",
        "Proximity to others":"81.5",
        "Exposure to disease":"12.5",
        "Total in employment":"78000" },
      { "Occupation title":"Roofers, roof tilers and slaters",
        "Proximity to others":"77.0",
        "Exposure to disease":"4.0",
        "Total in employment":"50000" },
      { "Occupation title":"Plumbers and heating and ventilating engineers",
        "Proximity to others":"73.3",
        "Exposure to disease":"38.3",
        "Total in employment":"186000" },
      { "Occupation title":"Carpenters and joiners",
        "Proximity to others":"80.0",
        "Exposure to disease":"9.0",
        "Total in employment":"221000" },
      { "Occupation title":"Glaziers, window fabricators and fitters",
        "Proximity to others":"69.0",
        "Exposure to disease":"18.0",
        "Total in employment":"40000" },
      { "Occupation title":"Construction and building trades n.e.c.",
        "Proximity to others":"50.0",
        "Exposure to disease":"4.0",
        "Total in employment":"252000" },
      { "Occupation title":"Plasterers",
        "Proximity to others":"59.0",
        "Exposure to disease":"7.0",
        "Total in employment":"48000" },
      { "Occupation title":"Floorers and wall tilers",
        "Proximity to others":"63.8",
        "Exposure to disease":"8.8",
        "Total in employment":"32000" },
      { "Occupation title":"Painters and decorators",
        "Proximity to others":"54.0",
        "Exposure to disease":"7.5",
        "Total in employment":"132000" },
      { "Occupation title":"Construction and building trades supervisors",
        "Proximity to others":"74.5",
        "Exposure to disease":"7.0",
        "Total in employment":"65000" },
      { "Occupation title":"Weavers and knitters",
        "Proximity to others":"55.0",
        "Exposure to disease":"3.0",
        "Total in employment":"3000" },
      { "Occupation title":"Upholsterers",
        "Proximity to others":"62.0",
        "Exposure to disease":"2.0",
        "Total in employment":"13000" },
      { "Occupation title":"Footwear and leather working trades",
        "Proximity to others":"55.0",
        "Exposure to disease":"3.0",
        "Total in employment":"5000" },
      { "Occupation title":"Tailors and dressmakers",
        "Proximity to others":"63.0",
        "Exposure to disease":"12.0",
        "Total in employment":"13000" },
      { "Occupation title":"Textiles, garments and related trades n.e.c.",
        "Proximity to others":"50.0",
        "Exposure to disease":"10.0",
        "Total in employment":"15000" },
      { "Occupation title":"Pre-press technicians",
        "Proximity to others":"50.5",
        "Exposure to disease":"1.0",
        "Total in employment":"3000" },
      { "Occupation title":"Printers",
        "Proximity to others":"42.0",
        "Exposure to disease":"0.0",
        "Total in employment":"29000" },
      { "Occupation title":"Print finishing and binding workers",
        "Proximity to others":"55.0",
        "Exposure to disease":"0.0",
        "Total in employment":"9000" },
      { "Occupation title":"Butchers",
        "Proximity to others":"67.5",
        "Exposure to disease":"13.0",
        "Total in employment":"29000" },
      { "Occupation title":"Bakers and flour confectioners",
        "Proximity to others":"55.0",
        "Exposure to disease":"7.0",
        "Total in employment":"31000" },
      { "Occupation title":"Fishmongers and poultry dressers",
        "Proximity to others":"67.5",
        "Exposure to disease":"13.0",
        "Total in employment":"11000" },
      { "Occupation title":"Chefs",
        "Proximity to others":"88.0",
        "Exposure to disease":"20.5",
        "Total in employment":"244000" },
      { "Occupation title":"Cooks",
        "Proximity to others":"66.6",
        "Exposure to disease":"18.4",
        "Total in employment":"70000" },
      { "Occupation title":"Catering and bar managers",
        "Proximity to others":"78.0",
        "Exposure to disease":"10.0",
        "Total in employment":"68000" },
      { "Occupation title":"Glass and ceramics makers, decorators and finishers",
        "Proximity to others":"51.4",
        "Exposure to disease":"2.6",
        "Total in employment":"11000" },
      { "Occupation title":"Furniture makers and other craft woodworkers",
        "Proximity to others":"54.0",
        "Exposure to disease":"4.3",
        "Total in employment":"40000" },
      { "Occupation title":"Florists",
        "Proximity to others":"68.0",
        "Exposure to disease":"27.0",
        "Total in employment":"11000" },
      { "Occupation title":"Other skilled trades n.e.c.",
        "Proximity to others":"52.0",
        "Exposure to disease":"0.5",
        "Total in employment":"37000" },
      { "Occupation title":"Nursery nurses and assistants",
        "Proximity to others":"88.0",
        "Exposure to disease":"36.0",
        "Total in employment":"224000" },
      { "Occupation title":"Childminders and related occupations",
        "Proximity to others":"79.8",
        "Exposure to disease":"30.0",
        "Total in employment":"106000" },
      { "Occupation title":"Playworkers",
        "Proximity to others":"79.8",
        "Exposure to disease":"30.0",
        "Total in employment":"31000" },
      { "Occupation title":"Teaching assistants",
        "Proximity to others":"88.0",
        "Exposure to disease":"36.0",
        "Total in employment":"309000" },
      { "Occupation title":"Educational support assistants",
        "Proximity to others":"88.0",
        "Exposure to disease":"36.0",
        "Total in employment":"167000" },
      { "Occupation title":"Veterinary nurses",
        "Proximity to others":"90.0",
        "Exposure to disease":"77.0",
        "Total in employment":"18000" },
      { "Occupation title":"Pest control officers",
        "Proximity to others":"49.3",
        "Exposure to disease":"16.0",
        "Total in employment":"8000" },
      { "Occupation title":"Animal care services occupations n.e.c.",
        "Proximity to others":"77.0",
        "Exposure to disease":"41.8",
        "Total in employment":"84000" },
      { "Occupation title":"Nursing auxiliaries and assistants",
        "Proximity to others":"90.0",
        "Exposure to disease":"87.0",
        "Total in employment":"338000" },
      { "Occupation title":"Ambulance staff (excluding paramedics)",
        "Proximity to others":"97.0",
        "Exposure to disease":"89.0",
        "Total in employment":"23000" },
      { "Occupation title":"Dental nurses",
        "Proximity to others":"99.5",
        "Exposure to disease":"98.0",
        "Total in employment":"52000" },
      { "Occupation title":"Houseparents and residential wardens",
        "Proximity to others":"88.1",
        "Exposure to disease":"90.6",
        "Total in employment":"49000" },
      { "Occupation title":"Care workers and home carers",
        "Proximity to others":"84.8",
        "Exposure to disease":"41.3",
        "Total in employment":"773000" },
      { "Occupation title":"Senior care workers",
        "Proximity to others":"84.8",
        "Exposure to disease":"41.3",
        "Total in employment":"77000" },
      { "Occupation title":"Care escorts",
        "Proximity to others":"88.1",
        "Exposure to disease":"90.6",
        "Total in employment":"13000" },
      { "Occupation title":"Undertakers, mortuary and crematorium assistants",
        "Proximity to others":"71.5",
        "Exposure to disease":"68.5",
        "Total in employment":"26000" },
      { "Occupation title":"Sports and leisure assistants",
        "Proximity to others":"72.4",
        "Exposure to disease":"25.8",
        "Total in employment":"64000" },
      { "Occupation title":"Travel agents",
        "Proximity to others":"59.7",
        "Exposure to disease":"5.3",
        "Total in employment":"36000" },
      { "Occupation title":"Air travel assistants",
        "Proximity to others":"85.0",
        "Exposure to disease":"40.0",
        "Total in employment":"59000" },
      { "Occupation title":"Rail travel assistants",
        "Proximity to others":"79.5",
        "Exposure to disease":"21.5",
        "Total in employment":"15000" },
      { "Occupation title":"Leisure and travel service occupations n.e.c.",
        "Proximity to others":"73.5",
        "Exposure to disease":"15.8",
        "Total in employment":"29000" },
      { "Occupation title":"Hairdressers and barbers",
        "Proximity to others":"89.0",
        "Exposure to disease":"32.8",
        "Total in employment":"166000" },
      { "Occupation title":"Beauticians and related occupations",
        "Proximity to others":"89.6",
        "Exposure to disease":"23.6",
        "Total in employment":"95000" },
      { "Occupation title":"Housekeepers and related occupations",
        "Proximity to others":"51.0",
        "Exposure to disease":"47.0",
        "Total in employment":"50000" },
      { "Occupation title":"Caretakers",
        "Proximity to others":"48.0",
        "Exposure to disease":"47.0",
        "Total in employment":"70000" },
      { "Occupation title":"Cleaning and housekeeping managers and supervisors",
        "Proximity to others":"51.0",
        "Exposure to disease":"47.0",
        "Total in employment":"71000" },
      { "Occupation title":"Sales and retail assistants",
        "Proximity to others":"68.0",
        "Exposure to disease":"9.5",
        "Total in employment":"1048000" },
      { "Occupation title":"Retail cashiers and check-out operators",
        "Proximity to others":"72.5",
        "Exposure to disease":"27.5",
        "Total in employment":"178000" },
      { "Occupation title":"Telephone salespersons",
        "Proximity to others":"77.0",
        "Exposure to disease":"5.0",
        "Total in employment":"32000" },
      { "Occupation title":"Pharmacy and other dispensing assistants",
        "Proximity to others":"75.5",
        "Exposure to disease":"40.8",
        "Total in employment":"79000" },
      { "Occupation title":"Vehicle and parts salespersons and advisers",
        "Proximity to others":"68.0",
        "Exposure to disease":"9.5",
        "Total in employment":"50000" },
      { "Occupation title":"Collector salespersons and credit agents",
        "Proximity to others":"67.0",
        "Exposure to disease":"7.0",
        "Total in employment":"14000" },
      { "Occupation title":"Debt, rent and other cash collectors",
        "Proximity to others":"42.0",
        "Exposure to disease":"7.5",
        "Total in employment":"28000" },
      { "Occupation title":"Roundspersons and van salespersons",
        "Proximity to others":"67.0",
        "Exposure to disease":"7.0",
        "Total in employment":"28000" },
      { "Occupation title":"Market and street traders and assistants",
        "Proximity to others":"67.0",
        "Exposure to disease":"7.0",
        "Total in employment":"15000" },
      { "Occupation title":"Merchandisers and window dressers",
        "Proximity to others":"67.0",
        "Exposure to disease":"0.0",
        "Total in employment":"21000" },
      { "Occupation title":"Sales related occupations n.e.c.",
        "Proximity to others":"67.0",
        "Exposure to disease":"0.0",
        "Total in employment":"60000" },
      { "Occupation title":"Sales supervisors",
        "Proximity to others":"66.0",
        "Exposure to disease":"10.0",
        "Total in employment":"174000" },
      { "Occupation title":"Call and contact centre occupations",
        "Proximity to others":"62.0",
        "Exposure to disease":"37.7",
        "Total in employment":"93000" },
      { "Occupation title":"Telephonists",
        "Proximity to others":"65.5",
        "Exposure to disease":"21.0",
        "Total in employment":"7000" },
      { "Occupation title":"Communication operators",
        "Proximity to others":"65.5",
        "Exposure to disease":"21.0",
        "Total in employment":"37000" },
      { "Occupation title":"Market research interviewers",
        "Proximity to others":"73.0",
        "Exposure to disease":"23.0",
        "Total in employment":"13000" },
      { "Occupation title":"Customer service occupations n.e.c.",
        "Proximity to others":"47.5",
        "Exposure to disease":"17.0",
        "Total in employment":"313000" },
      { "Occupation title":"Customer service managers and supervisors",
        "Proximity to others":"47.0",
        "Exposure to disease":"9.0",
        "Total in employment":"180000" },
      { "Occupation title":"Food, drink and tobacco process operatives",
        "Proximity to others":"55.8",
        "Exposure to disease":"8.2",
        "Total in employment":"130000" },
      { "Occupation title":"Glass and ceramics process operatives",
        "Proximity to others":"53.3",
        "Exposure to disease":"5.6",
        "Total in employment":"3000" },
      { "Occupation title":"Textile process operatives",
        "Proximity to others":"64.0",
        "Exposure to disease":"5.0",
        "Total in employment":"10000" },
      { "Occupation title":"Chemical and related process operatives",
        "Proximity to others":"53.7",
        "Exposure to disease":"5.2",
        "Total in employment":"41000" },
      { "Occupation title":"Rubber process operatives",
        "Proximity to others":"55.3",
        "Exposure to disease":"5.8",
        "Total in employment":"7000" },
      { "Occupation title":"Plastics process operatives",
        "Proximity to others":"58.3",
        "Exposure to disease":"3.6",
        "Total in employment":"18000" },
      { "Occupation title":"Metal making and treating process operatives",
        "Proximity to others":"54.2",
        "Exposure to disease":"5.0",
        "Total in employment":"11000" },
      { "Occupation title":"Electroplaters",
        "Proximity to others":"55.0",
        "Exposure to disease":"10.7",
        "Total in employment":"5000" },
      { "Occupation title":"Process operatives n.e.c.",
        "Proximity to others":"52.5",
        "Exposure to disease":"7.7",
        "Total in employment":"11000" },
      { "Occupation title":"Paper and wood machine operatives",
        "Proximity to others":"51.0",
        "Exposure to disease":"1.0",
        "Total in employment":"25000" },
      { "Occupation title":"Coal mine operatives",
        "Proximity to others":"53.3",
        "Exposure to disease":"8.3",
        "Total in employment":"3000" },
      { "Occupation title":"Quarry workers and related operatives",
        "Proximity to others":"59.6",
        "Exposure to disease":"7.3",
        "Total in employment":"10000" },
      { "Occupation title":"Energy plant operatives",
        "Proximity to others":"61.9",
        "Exposure to disease":"14.4",
        "Total in employment":"7000" },
      { "Occupation title":"Metal working machine operatives",
        "Proximity to others":"53.6",
        "Exposure to disease":"4.5",
        "Total in employment":"58000" },
      { "Occupation title":"Water and sewerage plant operatives",
        "Proximity to others":"58.3",
        "Exposure to disease":"11.5",
        "Total in employment":"14000" },
      { "Occupation title":"Printing machine assistants",
        "Proximity to others":"42.0",
        "Exposure to disease":"0.0",
        "Total in employment":"9000" },
      { "Occupation title":"Plant and machine operatives n.e.c.",
        "Proximity to others":"54.0",
        "Exposure to disease":"3.5",
        "Total in employment":"20000" },
      { "Occupation title":"Assemblers (electrical and electronic products)",
        "Proximity to others":"53.4",
        "Exposure to disease":"3.0",
        "Total in employment":"26000" },
      { "Occupation title":"Assemblers (vehicles and metal goods)",
        "Proximity to others":"64.5",
        "Exposure to disease":"4.5",
        "Total in employment":"44000" },
      { "Occupation title":"Routine inspectors and testers",
        "Proximity to others":"65.0",
        "Exposure to disease":"4.0",
        "Total in employment":"73000" },
      { "Occupation title":"Weighers, graders and sorters",
        "Proximity to others":"65.0",
        "Exposure to disease":"4.0",
        "Total in employment":"17000" },
      { "Occupation title":"Tyre, exhaust and windscreen fitters",
        "Proximity to others":"55.7",
        "Exposure to disease":"10.0",
        "Total in employment":"17000" },
      { "Occupation title":"Sewing machinists",
        "Proximity to others":"62.0",
        "Exposure to disease":"0.0",
        "Total in employment":"33000" },
      { "Occupation title":"Assemblers and routine operatives n.e.c.",
        "Proximity to others":"66.0",
        "Exposure to disease":"0.0",
        "Total in employment":"43000" },
      { "Occupation title":"Scaffolders, stagers and riggers",
        "Proximity to others":"70.5",
        "Exposure to disease":"7.5",
        "Total in employment":"27000" },
      { "Occupation title":"Road construction operatives",
        "Proximity to others":"76.5",
        "Exposure to disease":"20.0",
        "Total in employment":"22000" },
      { "Occupation title":"Rail construction and maintenance operatives",
        "Proximity to others":"76.5",
        "Exposure to disease":"20.0",
        "Total in employment":"9000" },
      { "Occupation title":"Construction operatives n.e.c.",
        "Proximity to others":"68.5",
        "Exposure to disease":"29.5",
        "Total in employment":"109000" },
      { "Occupation title":"Large goods vehicle drivers",
        "Proximity to others":"54.0",
        "Exposure to disease":"11.5",
        "Total in employment":"304000" },
      { "Occupation title":"Van drivers",
        "Proximity to others":"75.8",
        "Exposure to disease":"27.4",
        "Total in employment":"283000" },
      { "Occupation title":"Bus and coach drivers",
        "Proximity to others":"73.8",
        "Exposure to disease":"43.3",
        "Total in employment":"118000" },
      { "Occupation title":"Taxi and cab drivers and chauffeurs",
        "Proximity to others":"75.8",
        "Exposure to disease":"27.4",
        "Total in employment":"231000" },
      { "Occupation title":"Driving instructors",
        "Proximity to others":"76.0",
        "Exposure to disease":"8.0",
        "Total in employment":"34000" },
      { "Occupation title":"Crane drivers",
        "Proximity to others":"56.8",
        "Exposure to disease":"10.0",
        "Total in employment":"14000" },
      { "Occupation title":"Fork-lift truck drivers",
        "Proximity to others":"50.0",
        "Exposure to disease":"10.0",
        "Total in employment":"93000" },
      { "Occupation title":"Agricultural machinery drivers",
        "Proximity to others":"26.5",
        "Exposure to disease":"2.0",
        "Total in employment":"5000" },
      { "Occupation title":"Mobile machine drivers and operatives n.e.c.",
        "Proximity to others":"50.4",
        "Exposure to disease":"4.2",
        "Total in employment":"49000" },
      { "Occupation title":"Train and tram drivers",
        "Proximity to others":"54.7",
        "Exposure to disease":"15.3",
        "Total in employment":"32000" },
      { "Occupation title":"Marine and waterways transport operatives",
        "Proximity to others":"74.0",
        "Exposure to disease":"13.5",
        "Total in employment":"5000" },
      { "Occupation title":"Air transport operatives",
        "Proximity to others":"63.4",
        "Exposure to disease":"9.0",
        "Total in employment":"16000" },
      { "Occupation title":"Rail transport operatives",
        "Proximity to others":"56.7",
        "Exposure to disease":"15.3",
        "Total in employment":"16000" },
      { "Occupation title":"Other drivers and transport operatives n.e.c.",
        "Proximity to others":"63.4",
        "Exposure to disease":"9.0",
        "Total in employment":"21000" },
      { "Occupation title":"Farm workers",
        "Proximity to others":"42.3",
        "Exposure to disease":"13.3",
        "Total in employment":"58000" },
      { "Occupation title":"Forestry workers",
        "Proximity to others":"53.4",
        "Exposure to disease":"13.4",
        "Total in employment":"6000" },
      { "Occupation title":"Fishing and other elementary agriculture occupations n.e.c.",
        "Proximity to others":"46.3",
        "Exposure to disease":"3.7",
        "Total in employment":"21000" },
      { "Occupation title":"Elementary construction occupations",
        "Proximity to others":"67.6",
        "Exposure to disease":"13.7",
        "Total in employment":"158000" },
      { "Occupation title":"Industrial cleaning process occupations",
        "Proximity to others":"57.0",
        "Exposure to disease":"2.0",
        "Total in employment":"29000" },
      { "Occupation title":"Packers, bottlers, canners and fillers",
        "Proximity to others":"70.0",
        "Exposure to disease":"5.0",
        "Total in employment":"131000" },
      { "Occupation title":"Elementary process plant occupations n.e.c.",
        "Proximity to others":"57.0",
        "Exposure to disease":"2.0",
        "Total in employment":"95000" },
      { "Occupation title":"Postal workers, mail sorters, messengers and couriers",
        "Proximity to others":"64.0",
        "Exposure to disease":"20.8",
        "Total in employment":"160000" },
      { "Occupation title":"Elementary administration occupations n.e.c.",
        "Proximity to others":"61.5",
        "Exposure to disease":"41.5",
        "Total in employment":"32000" },
      { "Occupation title":"Window cleaners",
        "Proximity to others":"48.0",
        "Exposure to disease":"47.0",
        "Total in employment":"28000" },
      { "Occupation title":"Cleaners and domestics",
        "Proximity to others":"48.3",
        "Exposure to disease":"38.3",
        "Total in employment":"585000" },
      { "Occupation title":"Launderers, dry cleaners and pressers",
        "Proximity to others":"35.0",
        "Exposure to disease":"4.0",
        "Total in employment":"27000" },
      { "Occupation title":"Refuse and salvage occupations",
        "Proximity to others":"48.5",
        "Exposure to disease":"39.5",
        "Total in employment":"37000" },
      { "Occupation title":"Vehicle valeters and cleaners",
        "Proximity to others":"55.0",
        "Exposure to disease":"16.0",
        "Total in employment":"30000" },
      { "Occupation title":"Elementary cleaning occupations n.e.c.",
        "Proximity to others":"48.3",
        "Exposure to disease":"38.3",
        "Total in employment":"7000" },
      { "Occupation title":"Security guards and related occupations",
        "Proximity to others":"77.3",
        "Exposure to disease":"33.0",
        "Total in employment":"190000" },
      { "Occupation title":"Parking and civil enforcement occupations",
        "Proximity to others":"68.0",
        "Exposure to disease":"14.2",
        "Total in employment":"14000" },
      { "Occupation title":"School midday and crossing patrol occupations",
        "Proximity to others":"68.0",
        "Exposure to disease":"14.2",
        "Total in employment":"92000" },
      { "Occupation title":"Elementary security occupations n.e.c.",
        "Proximity to others":"68.0",
        "Exposure to disease":"14.2",
        "Total in employment":"23000" },
      { "Occupation title":"Shelf fillers",
        "Proximity to others":"69.0",
        "Exposure to disease":"13.3",
        "Total in employment":"80000" },
      { "Occupation title":"Elementary sales occupations n.e.c.",
        "Proximity to others":"67.0",
        "Exposure to disease":"7.0",
        "Total in employment":"28000" },
      { "Occupation title":"Elementary storage occupations",
        "Proximity to others":"63.4",
        "Exposure to disease":"9.0",
        "Total in employment":"440000" },
      { "Occupation title":"Hospital porters",
        "Proximity to others":"48.3",
        "Exposure to disease":"38.3",
        "Total in employment":"19000" },
      { "Occupation title":"Kitchen and catering assistants",
        "Proximity to others":"71.3",
        "Exposure to disease":"17.0",
        "Total in employment":"505000" },
      { "Occupation title":"Waiters and waitresses",
        "Proximity to others":"75.0",
        "Exposure to disease":"27.5",
        "Total in employment":"268000" },
      { "Occupation title":"Bar staff",
        "Proximity to others":"79.0",
        "Exposure to disease":"4.0",
        "Total in employment":"204000" },
      { "Occupation title":"Leisure and theme park attendants",
        "Proximity to others":"68.0",
        "Exposure to disease":"14.2",
        "Total in employment":"35000" },
      { "Occupation title":"Other elementary services occupations n.e.c.",
        "Proximity to others":"64.8",
        "Exposure to disease":"27.9",
        "Total in employment":"26000" } ];

    /* src/App.svelte generated by Svelte v3.23.2 */
    const file$7 = "src/App.svelte";

    function get_each_context$3(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[13] = list[i];
    	return child_ctx;
    }

    // (51:2) {#each ['Proximity to others','Exposure to disease','Total in employment'] as d}
    function create_each_block$3(ctx) {
    	let option;
    	let t;
    	let option_value_value;

    	const block = {
    		c: function create() {
    			option = element("option");
    			t = text(/*d*/ ctx[13]);
    			option.__value = option_value_value = /*d*/ ctx[13];
    			option.value = option.__value;
    			add_location(option, file$7, 51, 3, 1324);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, option, anchor);
    			append_dev(option, t);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(option);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$3.name,
    		type: "each",
    		source: "(51:2) {#each ['Proximity to others','Exposure to disease','Total in employment'] as d}",
    		ctx
    	});

    	return block;
    }

    // (66:2) <Svg>
    function create_default_slot_3(ctx) {
    	let axisx;
    	let t0;
    	let axisy;
    	let t1;
    	let plot;
    	let current;
    	axisx = new AxisX({ $$inline: true });
    	axisy = new AxisY({ $$inline: true });
    	plot = new Bubble_svg({ $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(axisx.$$.fragment);
    			t0 = space();
    			create_component(axisy.$$.fragment);
    			t1 = space();
    			create_component(plot.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(axisx, target, anchor);
    			insert_dev(target, t0, anchor);
    			mount_component(axisy, target, anchor);
    			insert_dev(target, t1, anchor);
    			mount_component(plot, target, anchor);
    			current = true;
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(axisx.$$.fragment, local);
    			transition_in(axisy.$$.fragment, local);
    			transition_in(plot.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(axisx.$$.fragment, local);
    			transition_out(axisy.$$.fragment, local);
    			transition_out(plot.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(axisx, detaching);
    			if (detaching) detach_dev(t0);
    			destroy_component(axisy, detaching);
    			if (detaching) detach_dev(t1);
    			destroy_component(plot, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_3.name,
    		type: "slot",
    		source: "(66:2) <Svg>",
    		ctx
    	});

    	return block;
    }

    // (72:4) <QuadTree      let:x      let:y      let:visible      let:found      let:r     >
    function create_default_slot_2(ctx) {
    	let div0;
    	let t0;
    	let div1;
    	let t1_value = /*found*/ ctx[11]["name"] + "";
    	let t1;

    	const block = {
    		c: function create() {
    			div0 = element("div");
    			t0 = space();
    			div1 = element("div");
    			t1 = text(t1_value);
    			attr_dev(div0, "class", "circle svelte-1kls0qe");
    			set_style(div0, "top", /*y*/ ctx[9] + "px");
    			set_style(div0, "left", /*x*/ ctx[8] + "px");
    			set_style(div0, "height", 2 * /*r*/ ctx[12] + "px");
    			set_style(div0, "width", 2 * /*r*/ ctx[12] + "px");
    			set_style(div0, "display", /*visible*/ ctx[10] ? "block" : "none");
    			add_location(div0, file$7, 78, 5, 1718);
    			attr_dev(div1, "class", "tooltip svelte-1kls0qe");
    			set_style(div1, "top", /*y*/ ctx[9] + "px");
    			set_style(div1, "left", /*x*/ ctx[8] + "px");
    			set_style(div1, "display", /*visible*/ ctx[10] ? "block" : "none");
    			add_location(div1, file$7, 82, 5, 1858);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div0, anchor);
    			insert_dev(target, t0, anchor);
    			insert_dev(target, div1, anchor);
    			append_dev(div1, t1);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*y*/ 512) {
    				set_style(div0, "top", /*y*/ ctx[9] + "px");
    			}

    			if (dirty & /*x*/ 256) {
    				set_style(div0, "left", /*x*/ ctx[8] + "px");
    			}

    			if (dirty & /*r*/ 4096) {
    				set_style(div0, "height", 2 * /*r*/ ctx[12] + "px");
    			}

    			if (dirty & /*r*/ 4096) {
    				set_style(div0, "width", 2 * /*r*/ ctx[12] + "px");
    			}

    			if (dirty & /*visible*/ 1024) {
    				set_style(div0, "display", /*visible*/ ctx[10] ? "block" : "none");
    			}

    			if (dirty & /*found*/ 2048 && t1_value !== (t1_value = /*found*/ ctx[11]["name"] + "")) set_data_dev(t1, t1_value);

    			if (dirty & /*y*/ 512) {
    				set_style(div1, "top", /*y*/ ctx[9] + "px");
    			}

    			if (dirty & /*x*/ 256) {
    				set_style(div1, "left", /*x*/ ctx[8] + "px");
    			}

    			if (dirty & /*visible*/ 1024) {
    				set_style(div1, "display", /*visible*/ ctx[10] ? "block" : "none");
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div0);
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(div1);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_2.name,
    		type: "slot",
    		source: "(72:4) <QuadTree      let:x      let:y      let:visible      let:found      let:r     >",
    		ctx
    	});

    	return block;
    }

    // (71:2) <Html>
    function create_default_slot_1(ctx) {
    	let quadtree;
    	let current;

    	quadtree = new QuadTree({
    			props: {
    				$$slots: {
    					default: [
    						create_default_slot_2,
    						({ x, y, visible, found, r }) => ({
    							8: x,
    							9: y,
    							10: visible,
    							11: found,
    							12: r
    						}),
    						({ x, y, visible, found, r }) => (x ? 256 : 0) | (y ? 512 : 0) | (visible ? 1024 : 0) | (found ? 2048 : 0) | (r ? 4096 : 0)
    					]
    				},
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(quadtree.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(quadtree, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const quadtree_changes = {};

    			if (dirty & /*$$scope, y, x, visible, found, r*/ 73472) {
    				quadtree_changes.$$scope = { dirty, ctx };
    			}

    			quadtree.$set(quadtree_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(quadtree.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(quadtree.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(quadtree, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_1.name,
    		type: "slot",
    		source: "(71:2) <Html>",
    		ctx
    	});

    	return block;
    }

    // (57:1) <LayerCake   padding={{ top: 20, right: 20, bottom: 20, left: 25 }}   x='x'   y='y'   r='r'   yDomain={[0,100]}   xDomain={[0,null]}   data={$tweenedPoints}  >
    function create_default_slot(ctx) {
    	let svg;
    	let t;
    	let html;
    	let current;

    	svg = new Svg({
    			props: {
    				$$slots: { default: [create_default_slot_3] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	html = new Html({
    			props: {
    				$$slots: { default: [create_default_slot_1] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(svg.$$.fragment);
    			t = space();
    			create_component(html.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(svg, target, anchor);
    			insert_dev(target, t, anchor);
    			mount_component(html, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const svg_changes = {};

    			if (dirty & /*$$scope*/ 65536) {
    				svg_changes.$$scope = { dirty, ctx };
    			}

    			svg.$set(svg_changes);
    			const html_changes = {};

    			if (dirty & /*$$scope*/ 65536) {
    				html_changes.$$scope = { dirty, ctx };
    			}

    			html.$set(html_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(svg.$$.fragment, local);
    			transition_in(html.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(svg.$$.fragment, local);
    			transition_out(html.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(svg, detaching);
    			if (detaching) detach_dev(t);
    			destroy_component(html, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot.name,
    		type: "slot",
    		source: "(57:1) <LayerCake   padding={{ top: 20, right: 20, bottom: 20, left: 25 }}   x='x'   y='y'   r='r'   yDomain={[0,100]}   xDomain={[0,null]}   data={$tweenedPoints}  >",
    		ctx
    	});

    	return block;
    }

    function create_fragment$7(ctx) {
    	let h2;
    	let t1;
    	let select;
    	let t2;
    	let div;
    	let layercake;
    	let current;
    	let mounted;
    	let dispose;
    	let each_value = ["Proximity to others", "Exposure to disease", "Total in employment"];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < 3; i += 1) {
    		each_blocks[i] = create_each_block$3(get_each_context$3(ctx, each_value, i));
    	}

    	layercake = new LayerCake({
    			props: {
    				padding: { top: 20, right: 20, bottom: 20, left: 25 },
    				x: "x",
    				y: "y",
    				r: "r",
    				yDomain: [0, 100],
    				xDomain: [0, null],
    				data: /*$tweenedPoints*/ ctx[1],
    				$$slots: { default: [create_default_slot] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			h2 = element("h2");
    			h2.textContent = "xKey";
    			t1 = space();
    			select = element("select");

    			for (let i = 0; i < 3; i += 1) {
    				each_blocks[i].c();
    			}

    			t2 = space();
    			div = element("div");
    			create_component(layercake.$$.fragment);
    			add_location(h2, file$7, 48, 0, 1197);
    			if (/*xKey*/ ctx[0] === void 0) add_render_callback(() => /*select_change_handler*/ ctx[3].call(select));
    			add_location(select, file$7, 49, 0, 1211);
    			attr_dev(div, "class", "chart-container svelte-1kls0qe");
    			add_location(div, file$7, 55, 0, 1376);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, h2, anchor);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, select, anchor);

    			for (let i = 0; i < 3; i += 1) {
    				each_blocks[i].m(select, null);
    			}

    			select_option(select, /*xKey*/ ctx[0]);
    			insert_dev(target, t2, anchor);
    			insert_dev(target, div, anchor);
    			mount_component(layercake, div, null);
    			current = true;

    			if (!mounted) {
    				dispose = listen_dev(select, "change", /*select_change_handler*/ ctx[3]);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*xKey*/ 1) {
    				select_option(select, /*xKey*/ ctx[0]);
    			}

    			const layercake_changes = {};
    			if (dirty & /*$tweenedPoints*/ 2) layercake_changes.data = /*$tweenedPoints*/ ctx[1];

    			if (dirty & /*$$scope*/ 65536) {
    				layercake_changes.$$scope = { dirty, ctx };
    			}

    			layercake.$set(layercake_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(layercake.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(layercake.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(h2);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(select);
    			destroy_each(each_blocks, detaching);
    			if (detaching) detach_dev(t2);
    			if (detaching) detach_dev(div);
    			destroy_component(layercake);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$7.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    const rKey = "Total in employment";

    function instance$7($$self, $$props, $$invalidate) {
    	let $tweenedPoints;
    	let xKey = "Proximity to others";
    	let yKey = "Exposure to disease";

    	let data = points.map(function (d) {
    		return {
    			"name": d["Occupation title"],
    			x: +d[xKey],
    			y: +d[yKey],
    			r: +d[rKey]
    		};
    	});

    	const tweenedPoints = tweened(data, { duration: 2000, easing: cubicInOut });
    	validate_store(tweenedPoints, "tweenedPoints");
    	component_subscribe($$self, tweenedPoints, value => $$invalidate(1, $tweenedPoints = value));

    	function setTween(key) {
    		tweenedPoints.set(temppoints);
    	}

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("App", $$slots, []);

    	function select_change_handler() {
    		xKey = select_value(this);
    		$$invalidate(0, xKey);
    	}

    	$$self.$capture_state = () => ({
    		LayerCake,
    		Svg,
    		Html,
    		Plot: Bubble_svg,
    		AxisX,
    		AxisY,
    		QuadTree,
    		tweened,
    		cubicInOut,
    		points,
    		xKey,
    		yKey,
    		rKey,
    		data,
    		tweenedPoints,
    		setTween,
    		temppoints,
    		$tweenedPoints
    	});

    	$$self.$inject_state = $$props => {
    		if ("xKey" in $$props) $$invalidate(0, xKey = $$props.xKey);
    		if ("yKey" in $$props) $$invalidate(5, yKey = $$props.yKey);
    		if ("data" in $$props) data = $$props.data;
    		if ("temppoints" in $$props) temppoints = $$props.temppoints;
    	};

    	let temppoints;

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*xKey*/ 1) {
    			 temppoints = points.map(function (d) {
    				return {
    					"name": d["Occupation title"],
    					x: +d[xKey],
    					y: +d[yKey],
    					r: +d[rKey]
    				};
    			});
    		}

    		if ($$self.$$.dirty & /*xKey*/ 1) {
    			 setTween();
    		}
    	};

    	return [xKey, $tweenedPoints, tweenedPoints, select_change_handler];
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$7, create_fragment$7, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "App",
    			options,
    			id: create_fragment$7.name
    		});
    	}
    }

    var hydrate = false;
    var config = {
    	hydrate: hydrate
    };

    const app = new App({
    	target: document.body,
    	hydrate: config.hydrate
    });

    return app;

}());
//# sourceMappingURL=bundle.js.map
