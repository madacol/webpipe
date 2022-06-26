# Webpipe

This will be a web extension that tries to bring the interoperability of Unix pipelines into ~~GUIs~~ webs

In reality it's more like a real-time copy - paster/eventTriggerer

<details>
  <summary>The rant</summary>

This is just a ~~rant~~ proof of concept, and definitely not related to OS's GUIs ecosystem and their failure to make interoperability intuitive and automatic. [More thoughts](https://twitter.com/madacol/status/1493602869659979789)

My hope is ~~to poke some nerves in the OS's community~~ to inspire users to interconnect ~~apps~~ web, and compose them with little to no coding.
</details>

The way it works is that it listens to changes on any **Html node (`.outerText` property)** and keeps it in sync with all the **inputs / textarea / contenteditable** attached to it, even if they are on a different tab / domain than the source.

And it doesn't just keeps text in sync, it will also be able to dispatch any event at the target

And that's all it does!, the extension by itself is kind of boring. But things get interesting when you start piping into [powerful pages](https://www.youtube.com/watch?v=x9YPPq81mTg&list=PLNb0YnM0RyKikrldCJ3hfWYxspbccqudE&index=7)

## Evolution

https://www.youtube.com/watch?v=i8vP2M1B5UY&list=PLNb0YnM0RyKikrldCJ3hfWYxspbccqudE&index=1
