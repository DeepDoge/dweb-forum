<script lang="ts">
    import { currentRoute } from "$/routes/_routing.svelte";
    import { getTimeline, Timeline as TImelineType, TimelineGroup } from "$/tools/api/app";
    import KButton from "$lib/kicho-ui/components/KButton.svelte";
    import KHoverMenu from "$lib/kicho-ui/components/KHoverMenu.svelte";
    import Post from "./Post.svelte";
    import Timeline from "./Timeline.svelte";

    export let account: string;
    let mentionsTimeline: TImelineType = null;
    $: newPostCount = mentionsTimeline?.newPostCount;

    $: account, onAccountChange();
    async function onAccountChange() {
        mentionsTimeline = null;
        mentionsTimeline = await getTimeline({ timelineId: { group: TimelineGroup.ProfileMentions, key: account } });
    }
</script>

<KButton color="slave" radius="fab">
    {#if !mentionsTimeline}
        N...
    {:else}
        N: {$newPostCount}
        <KHoverMenu radius="rounded" color="master" size="normal" background direction="left">
            <div class="notifications">
                <b>Notifications</b>
                <Timeline timeline={mentionsTimeline} let:postIds>
                    {#each postIds as postId (postId)}
                        <a href="#{$currentRoute.path}#{postId}">
                            <Post {postId} />
                        </a>
                    {/each}
                </Timeline>
            </div>
        </KHoverMenu>
    {/if}
</KButton>

<style>
    .notifications {
        width: min(40em, 100vw);
        padding: calc(var(--k-padding) * 2);
    }

    .notifications > b {
        font-size: var(--k-font-larger);
    }
</style>
